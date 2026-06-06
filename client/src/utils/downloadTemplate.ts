export function downloadTemplate() {
  const link = document.createElement('a');
  link.href = '/templates/guests-template.csv';
  link.download = 'guests-template.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
