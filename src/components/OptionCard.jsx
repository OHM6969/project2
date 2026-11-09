import { motion } from 'framer-motion'

export default function OptionCard({ label, selected, onClick, multi, index }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ease-out flex items-center gap-3 ${
        selected
          ? 'border-accent-500 bg-accent-50 dark:bg-accent-900/30 dark:border-accent-500 shadow-sm shadow-accent-500/10'
          : 'border-gray-100 dark:border-gray-700 hover:border-accent-300 dark:hover:border-accent-600 hover:shadow-sm bg-white dark:bg-gray-800'
      }`}
      aria-pressed={selected}
    >
      {/* Selection indicator */}
      <div className={`flex-shrink-0 w-5 h-5 rounded-${multi ? 'md' : 'full'} border-2 transition-all duration-200 flex items-center justify-center ${
        selected
          ? 'border-accent-500 bg-accent-500'
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        {selected && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 6L5 8.5L9.5 3.5" />
          </motion.svg>
        )}
      </div>

      <span className={`text-sm sm:text-base font-medium transition-colors flex-1 ${
        selected ? 'text-accent-700 dark:text-accent-300' : 'text-charcoal dark:text-gray-200'
      }`}>
        {label}
      </span>

      {index !== undefined && (
        <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-400 select-none">
          {index + 1}
        </span>
      )}

      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0"
        >
          <div className="w-2 h-2 rounded-full bg-accent-500" />
        </motion.div>
      )}
    </motion.button>
  )
}
