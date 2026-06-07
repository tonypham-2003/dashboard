const variants = {
  green:     'bg-green-100 text-green-800',
  yellow:    'bg-yellow-100 text-yellow-800',
  red:       'bg-red-100 text-red-800',
  correct:   'bg-green-100 text-green-800',
  incorrect: 'bg-red-100 text-red-800',
  yes:       'bg-blue-100 text-blue-700',
  no:        'bg-gray-100 text-gray-500',
}

export default function Badge({ variant = 'green', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${variants[variant] ?? variants.green}`}>
      {children}
    </span>
  )
}
