import {
  CompressionFilter,
  DrawingCompressionLibrariesEnum,
  DrawingCompressionLibrariesType,
  DrawingData,
  DrawingLibrariesType,
  DrawingSchema,
} from "@/typescript/@types/modules/drawing/drawing";
import Pako from "pako";

//generation
export const generateDrawingSchema = <
  LibraryType extends DrawingLibrariesType,
  CompressionType extends DrawingCompressionLibrariesType
>(
  jsonData: DrawingData<LibraryType>,
  library: LibraryType,
  compression: CompressionType
) => {
  // v = version number
  // l = drawing library;
  // c = compression library;
  // d = drawing data;
  return {
    v: 1,
    c: compression,
    l: library,
    d: compressDrawingObject<LibraryType, CompressionType>(
      jsonData,
      compression
    ),
  };
};
export const compressDrawingObject = <
  LibraryType extends DrawingLibrariesType,
  CompressionType extends DrawingCompressionLibrariesType
>(
  jsonData: DrawingData<LibraryType>,
  compression: CompressionType
): CompressionFilter<LibraryType, CompressionType>["d"] => {
  switch (compression) {
    case DrawingCompressionLibrariesEnum.pako: {
      return compressUsingPako(jsonData) as CompressionFilter<
        LibraryType,
        CompressionType
      >["d"];
    }
    case DrawingCompressionLibrariesEnum.none:
    default: {
      return jsonData as CompressionFilter<LibraryType, CompressionType>["d"];
    }
  }
};

const compressUsingPako = (jsonData: object | null) => {
  const str = JSON.stringify(jsonData);
  const compressed = btoa(String.fromCharCode(...Pako.deflate(str)));
  return compressed.toString();
};

//retrieves
export const retrieveDrawingSchemaData = <
  LibraryType extends DrawingLibrariesType
>(
  drawingSchema: DrawingSchema<LibraryType>
) => {
  switch (drawingSchema.c) {
    case DrawingCompressionLibrariesEnum.pako: {
      return JSON.parse(
        decompressUsingPako(drawingSchema.d)
      ) as DrawingData<LibraryType>;
    }
    case DrawingCompressionLibrariesEnum.none:
    default: {
      return drawingSchema.d as DrawingData<LibraryType>;
    }
  }
};

const decompressUsingPako = (data: string) => {
  return Pako.inflate(
    new Uint8Array(
      atob(data)
        .split("")
        .map((i) => i.charCodeAt(0))
    ),
    { to: "string" }
  );
};
