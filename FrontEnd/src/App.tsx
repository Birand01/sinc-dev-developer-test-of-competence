import { AppRouter } from '@/app/router'

/** Root shell: providers wrap this in main.tsx; all pages mount via AppRouter. */
function App() {
  return <AppRouter />
}

export default App
