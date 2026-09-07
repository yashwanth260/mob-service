const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add import for data
code = code.replace(
  /import \{ motion, AnimatePresence \} from 'framer-motion';/,
  "import { motion, AnimatePresence } from 'framer-motion';\nimport { mockProducts, mockBrands, mockServices, initialRepairs, mockTestimonials, initialStoreModels } from './data.js';"
);

// 2. Remove mock data blocks
code = code.replace(/const mockProducts = \[[\s\S]*?\];/g, '');
code = code.replace(/const mockBrands = \[[\s\S]*?\];/g, '');
code = code.replace(/const mockServices = \[[\s\S]*?\];/g, '');
code = code.replace(/const initialRepairs = \[[\s\S]*?\];/g, '');
code = code.replace(/const mockTestimonials = \[[\s\S]*?\];/g, '');
code = code.replace(/const initialStoreModels = \[[\s\S]*?\];/g, '');

// 3. Remove renderAdmin block
code = code.replace(/const renderAdmin = \(\) => \{[\s\S]*?\n  \};\n\n  return \(/, 'return (');

// 4. Update the handleNavClick for 'admin' to navigate to admin.html
code = code.replace(
  /const handleNavClick = \(view\) => \{/,
  "const handleNavClick = (view) => {\n    if (view === 'admin') {\n      window.location.href = '/admin.html';\n      return;\n    }"
);

// 5. Remove admin routes from the AnimatePresence block
code = code.replace(/\{currentView === 'admin' && renderAdmin\(\)\}/, '');

fs.writeFileSync('src/App.jsx', code);
console.log('App.jsx updated.');
