import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";
import { format as dateFormat } from "date-fns-tz";
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf, colorize } = format;

const config = {
  logFileName: path.join(__dirname, "../", "logs", "ECHO_BODY-%DATE%.log"),
  logFileSize: 10485760, // 10 MB
};

const istTimestamp = () => {
  return dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss zzz", {
    timeZone: "Asia/Kolkata",
  });
};

const myFormat = printf((info) => {
  return `${istTimestamp()} [${info.label}] ${info.level}: ${info.message}`;
});

const configlevels = {
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5,
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  verbose: "blue",
  debug: "cyan",
  silly: "magenta",
};

const SERVICE_NAME = process.env.SERVICE_NAME ?? "BACKEND_NODE";

const logDir = path.dirname(config.logFileName);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = createLogger({
  levels: configlevels,
  format: combine(
    label({ label: `[ECHOBODY][${SERVICE_NAME}]` }),
    timestamp({ format: istTimestamp }),
    myFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        label({ label: `[ECHOBODY][${SERVICE_NAME}]` }),
        timestamp({ format: istTimestamp }),
        myFormat
      ),
    }),
    new DailyRotateFile({
      filename: config.logFileName,
      datePattern: 'YYYY-MM-DD',
      maxSize: config.logFileSize, // 10 MB
      maxFiles: '28d', // Keep files for 28 days
      format: combine(
        label({ label: `[ECHOBODY][${SERVICE_NAME}]` }),
        timestamp({ format: istTimestamp }),
        myFormat
      ),
    }),
  ],
});

logger.info("Logger initialized successfully");

export { logger };
