const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'DataUpdateForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add isPastDate and disabledClass
content = content.replace(
  "  const isB360OrC650 = selectedAircraft?.tip === 'B-360' || selectedAircraft?.tip === 'C-650';",
  "  const isB360OrC650 = selectedAircraft?.tip === 'B-360' || selectedAircraft?.tip === 'C-650';\n\n  const todayStr = new Date().toISOString().split('T')[0];\n  const isPastDate = formData.islemTarihi !== todayStr && formData.islemTarihi < todayStr;\n  const disabledClass = isPastDate ? \" opacity-50 cursor-not-allowed\" : \"\";"
);

// Regex to find inputs, selects, textareas
const tagsRegex = /<(input|select|textarea)\s+([^>]*?)>/g;

content = content.replace(tagsRegex, (match, tag, attrs) => {
  if (
    attrs.includes('islemTarihi') ||
    attrs.includes('selectedKuyruk') ||
    attrs.includes('govdeUcusSaati') ||
    attrs.includes('password') ||
    attrs.includes('type="submit"') ||
    attrs.includes('type="button"') ||
    attrs.includes('type="date"') && attrs.includes('islemTarihi') ||
    attrs.includes('className="w-full bg-black/40') // this is for the password input and the main selects
  ) {
    return match;
  }

  // Add disabled={isPastDate}
  if (!attrs.includes('disabled={isPastDate}')) {
    attrs = `disabled={isPastDate} ` + attrs;
  }

  // Add disabledClass to className
  if (attrs.includes('className="')) {
    attrs = attrs.replace(/className="([^"]*)"/, 'className={`$1 ${disabledClass}`}');
  }

  return `<${tag} ${attrs}>`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done');
