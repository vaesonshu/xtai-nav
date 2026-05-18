---
name: nav-internal-search
description: 在星途导航 PostgreSQL 中按关键词、分类、标签筛选已收录网站；回答「库里有哪些」「某分类多少条」等问题。
---

# 站内库检索

## 何时使用

- 查询**已存在**的导航数据、审批状态、分类 slug。
- 需要先了解分类结构时用 **`listCategories`**，再按需 **`searchNavWebsites`**。

## 如何执行

1. 分类不明确时先 `listCategories`，用返回的 **slug** 填 `categorySlug`。
2. `searchNavWebsites`：可用 `query`（模糊匹配名称/描述/标签）、`tag`（精确标签）、`includeNonApproved`（是否含待审批）。
3. 回答时只引用工具返回字段，勿臆测未返回的 URL。
4. 若库内无结果，可建议用户加载 **`bing-web-search`** 技能做外网补充。
