-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "currentWineOrder" INTEGER NOT NULL DEFAULT 1,
    "creatorId" TEXT NOT NULL DEFAULT 'system'
);
INSERT INTO "new_Event" ("currentWineOrder", "date", "id", "name", "status") SELECT "currentWineOrder", "date", "id", "name", "status" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
