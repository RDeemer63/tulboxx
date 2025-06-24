// Comprehensive Dark Mode Update Script
// This script contains all the consistent patterns to apply across pages

const DARK_MODE_PATTERNS = {
  // Search input pattern
  searchInput: {
    from: 'className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"',
    to: 'className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400"'
  },
  
  // Input field pattern
  inputField: {
    from: 'className="pl-10"',
    to: 'className="pl-10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500"'
  },
  
  // Select trigger pattern
  selectTrigger: {
    from: '<SelectTrigger',
    to: '<SelectTrigger className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600"'
  },
  
  // Select content pattern
  selectContent: {
    from: '<SelectContent>',
    to: '<SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">'
  },
  
  // Select item pattern
  selectItem: {
    from: '<SelectItem value=',
    to: '<SelectItem value= className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700"'
  },
  
  // Status badge colors
  statusColors: {
    'dark:bg-gray-800': 'dark:bg-slate-800/50',
    'dark:bg-blue-900': 'dark:bg-blue-800/20',
    'dark:bg-green-900': 'dark:bg-green-800/20',
    'dark:bg-red-900': 'dark:bg-red-800/20',
    'dark:bg-yellow-900': 'dark:bg-yellow-800/20',
    'dark:bg-purple-900': 'dark:bg-purple-800/20'
  },
  
  // Label styling
  labelStyle: {
    from: '<label className="block text-sm font-medium mb-1">',
    to: '<label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">'
  },
  
  // Textarea styling
  textareaStyle: {
    pattern: 'className="',
    addition: 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500 '
  }
};

// Pages to update with their primary search/filter patterns
const PAGES_TO_UPDATE = [
  'invoices.tsx',
  'employees.tsx', 
  'schedule.tsx',
  'pipeline.tsx',
  'reports.tsx',
  'settings.tsx',
  'time-tracking.tsx',
  'calendar-production.tsx'
];

console.log('Dark mode patterns ready for application');