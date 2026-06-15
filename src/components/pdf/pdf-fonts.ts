import path from "path";
import { Font } from "@react-pdf/renderer";

const fontsDir = path.join(process.cwd(), "public/fonts");

Font.register({
  family: "DM Sans",
  fonts: [
    {
      src: path.join(fontsDir, "dm-sans-latin-400-normal.woff"),
      fontWeight: 400,
    },
    {
      src: path.join(fontsDir, "dm-sans-latin-500-normal.woff"),
      fontWeight: 500,
    },
    {
      src: path.join(fontsDir, "dm-sans-latin-700-normal.woff"),
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "Cormorant Garamond",
  fonts: [
    {
      src: path.join(fontsDir, "cormorant-garamond-latin-400-normal.woff"),
      fontWeight: 400,
    },
    {
      src: path.join(fontsDir, "cormorant-garamond-latin-600-normal.woff"),
      fontWeight: 600,
    },
    {
      src: path.join(fontsDir, "cormorant-garamond-latin-700-normal.woff"),
      fontWeight: 700,
    },
  ],
});
