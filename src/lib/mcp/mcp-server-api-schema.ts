import { z } from 'zod'

/** 创建/更新 MCP 配置时的校验（transport 与字段对应关系） */
export const mcpServerTransportSchema = z.enum(['stdio', 'http', 'sse'])

export const mcpServerCreateSchema = z
  .object({
    name: z.string().min(1, '名称不能为空').max(120),
    enabled: z.boolean().optional().default(true),
    transport: mcpServerTransportSchema,
    sortOrder: z.number().int().optional().default(0),
    stdioCommand: z.string().max(500).optional().nullable(),
    stdioArgs: z.array(z.string()).optional().nullable(),
    stdioCwd: z.string().max(500).optional().nullable(),
    streamUrl: z.string().url().max(2000).optional().nullable(),
    headersJson: z.record(z.string(), z.string()).optional().nullable(),
    elicitationEnabled: z.boolean().optional().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.transport === 'stdio') {
      if (!data.stdioCommand?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'stdio 模式必须填写命令',
          path: ['stdioCommand'],
        })
      }
    } else {
      if (!data.streamUrl?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'http/sse 模式必须填写流式 URL',
          path: ['streamUrl'],
        })
      }
    }
  })
