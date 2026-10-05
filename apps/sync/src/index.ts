import { AppConfig } from "./config/app-config";
import { ConsoleLogger } from "./core/console-logger";
import { HealthRoute } from "./http/health-route";
import { HttpServer } from "./http/http-server";
import { DocumentPathParser } from "./websocket/document-path-parser";
import { LoggingConnectionHandler } from "./websocket/logging-connection-handler";
import { WebSocketGateWay } from "./websocket/websocket-gateway";

const config = new AppConfig();
const logger = new ConsoleLogger();

const httpServer = new HttpServer([new HealthRoute()], logger);

const gateway = new WebSocketGateWay(
  new DocumentPathParser(),
  new LoggingConnectionHandler(logger),
);

httpServer.onUpgrade((req, socket, head) =>
  gateway.handleUpgrade(req, socket, head),
);

await httpServer.listen(config.port);
