const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'DataUpdateForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

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
    attrs.includes('className="w-full bg-black/40')
  ) {
    return match;
  }

  // Add disabledClass to className if it's not there
  if (attrs.includes('className="') && !attrs.includes('${disabledClass}')) {
    attrs = attrs.replace(/className="([^"]*)"/, 'className={`$1 ${disabledClass}`}');
  }

  return `<${tag} ${attrs}>`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done 2');
