import status from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import {
  ICartItemAdd,
  ICartItemUpdate,
  ICartItemRemove,
} from "./cart.interface";

const CART_EXPIRY_MINUTES = 30;

const getOrCreateCart = async (userId?: string, sessionId?: string) => {
  let cart: Prisma.CartGetPayload<{ include: { items: true } }> | null = null;

  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
  } else if (sessionId) {
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });
  }

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        ...(userId ? { userId } : {}),
        ...(sessionId ? { sessionId } : {}),
      },
      include: { items: true },
    });
  }

  return cart;
};

const getCart = async (cartId: string) => {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  imageUrl: true,
                  imagePublicId: true,
                  category: { select: { id: true, slug: true } },
                },
              },
            },
          },
          deductions: {
            include: {
              deduction: {
                select: {
                  id: true,
                  condition: true,
                  amount: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
      user: { select: { id: true, email: true, name: true } },
    },
  });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, "Cart not found");
  }

  return cart;
};

const addItem = async (cartId: string, payload: ICartItemAdd) => {
  // Verify variant exists
  const variant = await prisma.productVariant.findUnique({
    where: { id: payload.variantId },
  });
  if (!variant) {
    throw new AppError(status.NOT_FOUND, "Product variant not found");
  }

  // Verify deductions exist if provided
  if (payload.deductionIds && payload.deductionIds.length > 0) {
    const deductions = await prisma.variantDeduction.findMany({
      where: { id: { in: payload.deductionIds } },
    });
    if (deductions.length !== payload.deductionIds.length) {
      throw new AppError(
        status.BAD_REQUEST,
        "One or more deduction IDs are invalid",
      );
    }
  }

  const expiresAt = new Date(Date.now() + CART_EXPIRY_MINUTES * 60 * 1000);

  // Find existing cart item by cartId + variantId + condition
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId,
      variantId: payload.variantId,
      condition: payload.condition,
    },
  });

  let cartItem;
  if (existingItem) {
    cartItem = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: payload.quantity ?? 1,
        notes: payload.notes,
        expiresAt,
      },
    });
  } else {
    cartItem = await prisma.cartItem.create({
      data: {
        cartId,
        variantId: payload.variantId,
        condition: payload.condition,
        quantity: payload.quantity ?? 1,
        notes: payload.notes,
        expiresAt,
      },
    });
  }

  // Sync deductions if provided
  if (payload.deductionIds) {
    await prisma.cartItemDeduction.deleteMany({
      where: {
        cartItemId: cartItem.id,
        deductionId: { notIn: payload.deductionIds },
      },
    });

    await prisma.cartItemDeduction.createMany({
      data: payload.deductionIds.map((deductionId) => ({
        cartItemId: cartItem.id,
        deductionId,
      })),
      skipDuplicates: true,
    });
  }

  return getCart(cartId);
};

const updateItem = async (cartItemId: string, payload: ICartItemUpdate) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
  });

  if (!cartItem) {
    throw new AppError(status.NOT_FOUND, "Cart item not found");
  }

  const expiresAt = new Date(Date.now() + CART_EXPIRY_MINUTES * 60 * 1000);

  await prisma.cartItem.update({
    where: { id: cartItemId },
    data: {
      ...(payload.quantity !== undefined ? { quantity: payload.quantity } : {}),
      ...(payload.condition !== undefined
        ? { condition: payload.condition }
        : {}),
      ...(payload.notes !== undefined ? { notes: payload.notes } : {}),
      expiresAt,
    },
  });

  // Sync deductions if provided
  if (payload.deductionIds) {
    await prisma.cartItemDeduction.deleteMany({
      where: {
        cartItemId,
        deductionId: { notIn: payload.deductionIds },
      },
    });

    await prisma.cartItemDeduction.createMany({
      data: payload.deductionIds.map((deductionId) => ({
        cartItemId,
        deductionId,
      })),
      skipDuplicates: true,
    });
  }

  return getCart(cartItem.cartId);
};

const removeItems = async (cartId: string, payload: ICartItemRemove) => {
  const result = await prisma.cartItem.deleteMany({
    where: {
      id: { in: payload.itemIds },
      cartId,
    },
  });

  if (result.count === 0) {
    throw new AppError(status.NOT_FOUND, "No cart items found to remove");
  }

  return getCart(cartId);
};

const clearCart = async (cartId: string) => {
  await prisma.cartItem.deleteMany({
    where: { cartId },
  });

  return getCart(cartId);
};

const mergeGuestCart = async (sessionId: string, userId: string) => {
  const guestCart = await prisma.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) {
    return getOrCreateCart(userId);
  }

  const userCart = await getOrCreateCart(userId);

  // Merge items from guest cart into user cart
  for (const item of guestCart.items) {
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: userCart.id,
        variantId: item.variantId,
        condition: item.condition,
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: item.quantity,
          notes: item.notes,
          expiresAt: new Date(Date.now() + CART_EXPIRY_MINUTES * 60 * 1000),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          variantId: item.variantId,
          condition: item.condition,
          quantity: item.quantity,
          notes: item.notes,
          expiresAt: new Date(Date.now() + CART_EXPIRY_MINUTES * 60 * 1000),
        },
      });
    }
  }

  // Copy deductions for merged items
  const guestDeductions = await prisma.cartItemDeduction.findMany({
    where: { cartItemId: { in: guestCart.items.map((i) => i.id) } },
  });

  const mergedItems = await prisma.cartItem.findMany({
    where: { cartId: userCart.id },
  });

  for (const gd of guestDeductions) {
    const guestItem = guestCart.items.find((i) => i.id === gd.cartItemId);
    if (!guestItem) continue;

    const mergedItem = mergedItems.find(
      (mi) =>
        mi.variantId === guestItem.variantId &&
        mi.condition === guestItem.condition,
    );

    if (mergedItem) {
      await prisma.cartItemDeduction.upsert({
        where: {
          cartItemId_deductionId: {
            cartItemId: mergedItem.id,
            deductionId: gd.deductionId,
          },
        },
        update: {},
        create: {
          cartItemId: mergedItem.id,
          deductionId: gd.deductionId,
        },
      });
    }
  }

  // Delete guest cart
  await prisma.cart.delete({ where: { id: guestCart.id } });

  return getCart(userCart.id);
};

const cleanupExpiredItems = async () => {
  const result = await prisma.cartItem.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return result.count;
};

export const CartService = {
  getOrCreateCart,
  getCart,
  addItem,
  updateItem,
  removeItems,
  clearCart,
  mergeGuestCart,
  cleanupExpiredItems,
};
