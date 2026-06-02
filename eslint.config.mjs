import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'
import eslintConfigPrettier from 'eslint-config-prettier'

// Next.js 16 已移除 `next lint`，改用 ESLint flat config
const eslintConfig = [
  ...nextCoreWebVitals,
  eslintConfigPrettier,
  {
    // React Hooks v7 新增规则与现有「挂载时拉数 / mounted 标记」等写法冲突，先关闭以免阻塞提交
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
    },
  },
]

export default eslintConfig
