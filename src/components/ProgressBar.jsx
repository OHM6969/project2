import { motion } from 'framer-motion'

export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? ((current) / total) * 100 : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Question {current} of {total}
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {Math.round(pct)}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
