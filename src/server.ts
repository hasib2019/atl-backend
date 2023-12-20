import appFactory from "./app";
import { getPort } from "./configs/app.config";

(async function () {
  const PORT = getPort();
  const app = await appFactory();
  app.listen(PORT, () => console.log(`Server Listening on port ${PORT}`));
})();
