// Mock chalk for testing
const createChalkMock = () => {
  const colors = ['red', 'green', 'blue', 'yellow', 'magenta', 'cyan', 'gray', 'white', 'black'];
  const styles = ['bold', 'dim', 'italic', 'underline', 'inverse', 'strikethrough'];

  const mock = (text: string) => text;

  // Add color methods with chaining support
  colors.forEach(color => {
    const colorFn = (text: string) => `[${color.toUpperCase()}]${text}[/${color.toUpperCase()}]`;
    (mock as any)[color] = colorFn;

    // Add style chaining to each color
    styles.forEach(style => {
      (colorFn as any)[style] = (text: string) => `[${color.toUpperCase()}-${style.toUpperCase()}]${text}[/${color.toUpperCase()}-${style.toUpperCase()}]`;
    });
  });

  // Add style methods
  styles.forEach(style => {
    (mock as any)[style] = (text: string) => `[${style.toUpperCase()}]${text}[/${style.toUpperCase()}]`;
  });

  return mock;
};

export default createChalkMock();
