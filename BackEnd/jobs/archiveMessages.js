const { CronJob } = require("cron");
const { Op } = require("sequelize");
const sequelize = require("../utils/db");
const { chat, archivedChat } = require("../models");

const archiveOldMessages = async () => {
  const transaction = await sequelize.transaction();

  try {
    // Find messages older than 24 hours
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    console.log("Node current time:", new Date());
    console.log("Archive cutoff:", cutoffDate);
    console.log("Database:", await sequelize.getDatabaseName());

    console.log("Cutoff ISO:", cutoffDate.toISOString());
console.log("Cutoff local:", cutoffDate.toString());

const [diagnosticRows] = await sequelize.query(`
    SELECT
        NOW() AS mysqlTime,
        UTC_TIMESTAMP() AS utcTime,
        @@session.time_zone AS sessionTimeZone,
        @@system_time_zone AS systemTimeZone,
        DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') AS storedCreatedAt,
        TIMESTAMPDIFF(HOUR, createdAt, NOW()) AS ageInHours,
        createdAt < NOW() - INTERVAL 24 HOUR AS qualifies
    FROM chatMessages
    ORDER BY createdAt ASC
    LIMIT 5
`);

console.log("Timestamp diagnostic:", diagnosticRows);

    const oldMessages = await chat.findAll({
      where: {
        createdAt: {
          [Op.lt]: cutoffDate,
        },
      },
      transaction,
    });

    if (oldMessages.length === 0) {
      console.log("No old messages to archive.");
      await transaction.commit();
      return;
    }

    // Prepare archived records
    const archivedRecords = oldMessages.map((item) => ({
      originalMessageId: item.id,
      message: item.message,
      userId: item.userId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Copy messages to the archive table
    await archivedChat.bulkCreate(archivedRecords, {
      transaction,
    });

    // Delete originals only after copying succeeds
    const messageIds = oldMessages.map((item) => item.id);

    await chat.destroy({
      where: {
        id: {
          [Op.in]: messageIds,
        },
      },
      transaction,
    });

    await transaction.commit();

    console.log(`Successfully archived ${oldMessages.length} messages.`);
  } catch (error) {
    await transaction.rollback();
    console.error("Message archival failed:", error);
  }
};

// Run every day at midnight
const archiveJob = new CronJob("0 0 * * *", archiveOldMessages, null, false);

module.exports = { archiveJob, archiveOldMessages };
