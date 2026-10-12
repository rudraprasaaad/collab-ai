import { AppConfig } from "./config/app-config";
import { ConsoleLogger } from "./core/console-logger";
import { ServerState } from "./core/server-state";
import { ShutDownCoordinator } from "./core/shutdown-coordinator";
import { HealthRoute } from "./http/health-route";
import { HttpServer } from "./http/http-server";
import { DocumentPathParser } from "./websocket/document-path-parser";
import { HeartbeatConnectionHandler } from "./websocket/heartbeat-connection-handler";
import { HeartbeatMonitor } from "./websocket/heartbeat-monitor";
import { RoomConnectionHandler } from "./websocket/room-connection-handler";
import { RoomRegistry } from "./websocket/room-registry";
import { WebSocketGateWay } from "./websocket/websocket-gateway";

const config = new AppConfig();
const logger = new ConsoleLogger();

const state = new ServerState();
const registry = new RoomRegistry(logger);
const monitor = new HeartbeatMonitor(config.heartbeatIntervalMs, logger);

const gateway = new WebSocketGateWay(
  new DocumentPathParser(),
  new HeartbeatConnectionHandler(
    monitor,
    new RoomConnectionHandler(registry, logger),
  ),
);

const httpServer = new HttpServer([new HealthRoute(registry, state)], logger);
httpServer.onUpgrade((req, socket, head) =>
  gateway.handleUpgrade(req, socket, head),
);

new ShutDownCoordinator(
  state,
  [monitor, gateway, httpServer],
  config.shutdownTimeoutMs,
  logger,
).listen();

await httpServer.listen(config.port);
monitor.start();
