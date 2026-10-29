import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // A production build without a real API URL would ship a site that calls
  // the visitor's own machine (localhost) and fails every request with
  // "Failed to fetch" - stop the build instead. (Only for `vite build`;
  // `vite preview` just serves an existing dist.)
  if (command === 'build' && mode === 'production') {
    const env = loadEnv(mode, process.cwd(), '')
    const apiUrl = env.VITE_API_URL
    if (!apiUrl || /localhost|127\.0\.0\.1/.test(apiUrl)) {
      throw new Error(
        'VITE_API_URL must be set to your deployed backend for production builds ' +
          '(e.g. https://uzhiro-api.onrender.com/api). Set it in Netlify > Site configuration > Environment variables.'
      )
    }
  }

  return {
    plugins: [react()],
  }
})
