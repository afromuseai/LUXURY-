import { Router, type IRouter } from "express";
import { z } from "zod";
import { db, leadsTable, aiSessionsTable } from "@workspace/db";
import { eq, desc, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const ADMIN_PIN = process.env.ADMIN_PIN ?? "stageone2025";

function requireAdmin(req: Parameters<Parameters<typeof router.use>[0]>[0], res: Parameters<Parameters<typeof router.use>[0]>[1], next: Parameters<Parameters<typeof router.use>[0]>[2]): void {
  const pin = req.headers["x-admin-pin"] as string | undefined;
  if (pin !== ADMIN_PIN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.get("/admin/leads", requireAdmin, async (req, res): Promise<void> => {
  try {
    const leads = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt))
      .limit(200);
    res.json({ leads });
  } catch (err) {
    logger.error({ err }, "Failed to fetch leads");
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.get("/admin/stats", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [totalLeads] = await db.select({ count: count() }).from(leadsTable);
    const [totalSessions] = await db.select({ count: count() }).from(aiSessionsTable);

    const leadsBySource = await db
      .select({ source: leadsTable.source, count: count() })
      .from(leadsTable)
      .groupBy(leadsTable.source);

    const leadsByStatus = await db
      .select({ status: leadsTable.status, count: count() })
      .from(leadsTable)
      .groupBy(leadsTable.status);

    const sessionsByTool = await db
      .select({ tool: aiSessionsTable.tool, count: count() })
      .from(aiSessionsTable)
      .groupBy(aiSessionsTable.tool);

    const recentLeads = await db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt))
      .limit(5);

    res.json({
      totals: {
        leads: totalLeads?.count ?? 0,
        aiSessions: totalSessions?.count ?? 0,
      },
      leadsBySource,
      leadsByStatus,
      sessionsByTool,
      recentLeads,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

const UpdateLeadBody = z.object({
  status: z.enum(["new", "contacted", "qualified", "proposal_sent", "closed_won", "closed_lost"]).optional(),
  notes: z.string().optional(),
});

router.patch("/admin/leads/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lead ID" });
    return;
  }

  const parsed = UpdateLeadBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const [updated] = await db
      .update(leadsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(leadsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Lead not found" });
      return;
    }

    res.json({ success: true, lead: updated });
  } catch (err) {
    logger.error({ err }, "Failed to update lead");
    res.status(500).json({ error: "Failed to update lead" });
  }
});

router.delete("/admin/leads/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params["id"] ?? "", 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid lead ID" });
    return;
  }

  try {
    await db.delete(leadsTable).where(eq(leadsTable.id, id));
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to delete lead");
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

export default router;
