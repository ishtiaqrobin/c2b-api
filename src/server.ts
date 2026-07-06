import app from "./app";
import { env } from "./app/config/env";

const bootstrap = () => {
  try {
    app.listen(env.PORT, () => {
      console.log(`Server is running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server", error);
  }
};

bootstrap();
