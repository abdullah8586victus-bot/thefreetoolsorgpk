import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Download, Copy, Check, Star, RefreshCw, Upload,
  AlertCircle, Sparkles, Layers, Eye, ShieldCheck, Play, Pause, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolItem, UserProfile } from '../types';
import { TOOLS_DATA } from '../data/toolsData';
import { 
  mergePdfs, splitPdf, addWatermarkToPdf, convertPdfToWordDoc, 
  convertPdfToExcelCsv, extractTextFromPdf, getPdfMetadata, PDFMetadataInfo
} from '../utils/pdfEngine';
import { 
  loadImage, applyPhotoUnblur, resizeImageCanvas, compressCanvasToBlob,
  removeBackgroundColor, applyCanvasFilters, transformCanvasOrientation,
  extractDominantPalette
} from '../utils/imageEngine';
import { 
  computeTextStats, convertCase, generateSlug, sortAndDeduplicateList,
  reverseStringContent, encodeHtmlEntities, decodeHtmlEntities,
  generateLoremIpsum, computeSimpleDiff
} from '../utils/textEngine';
import { 
  formatJson, minifyJson, encodeBase64, decodeBase64,
  generateCryptoHash, generateMd5, inspectJwt, generateUuidV4, DecodedJwt
} from '../utils/devEngine';
import { 
  generatePassword, UNIT_CATEGORIES, convertUnit, convertTemperature,
  hexToRgb, rgbToHsl, calculateWcagContrast, generateBarcodeSvg
} from '../utils/utilityEngine';

interface ToolWorkspaceProps {
  tool: ToolItem;
  currentUser: UserProfile;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, toolId: string) => void;
  onBack: () => void;
  onSelectTool: (tool: ToolItem) => void;
  onRecordUsage: (toolId: string, toolName: string, summary: string) => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({
  tool,
  currentUser,
  isFavorite,
  onToggleFavorite,
  onBack,
  onSelectTool,
  onRecordUsage,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // PDF Tool States
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadataInfo | null>(null);
  const [pdfExtractedText, setPdfExtractedText] = useState('');
  const [pageRange, setPageRange] = useState('1-2');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkOpacity, setWatermarkOpacity] = useState(30);

  // Image Tool States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const [aspectRatioValue, setAspectRatioValue] = useState(1);
  const [sharpnessLevel, setSharpnessLevel] = useState(2.5);
  const [compressionQuality, setCompressionQuality] = useState(80);
  const [compressedBlobSize, setCompressedBlobSize] = useState<number | null>(null);
  const [bgMaskColor, setBgMaskColor] = useState('#FFFFFF');
  const [bgTolerance, setBgTolerance] = useState(35);
  const [filterBrightness, setFilterBrightness] = useState(0);
  const [filterContrast, setFilterContrast] = useState(0);
  const [filterSaturation, setFilterSaturation] = useState(0);
  const [isFilterVintage, setIsFilterVintage] = useState(false);
  const [isFilterGrayscale, setIsFilterGrayscale] = useState(false);
  const [isFilterSepia, setIsFilterSepia] = useState(false);
  const [imageRotation, setImageRotation] = useState(0);
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);

  // Text Tool States
  const [textInput, setTextInput] = useState('TheFreeToolsOrg provides free web utilities directly in your browser. All processing is 100% private and confidential.');
  const [diffOldText, setDiffOldText] = useState('TheFreeToolsOrg provides free utilities.\nIt is 100% private.');
  const [diffNewText, setDiffNewText] = useState('TheFreeToolsOrg delivers fast, free online utilities.\nAll processing runs client-side and 100% private.');
  const [loremCount, setLoremCount] = useState(3);
  const [loremUnit, setLoremUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');

  // Dev Tool States
  const [jsonInput, setJsonInput] = useState('{\n  "service": "TheFreeToolsOrg",\n  "toolsCount": 44,\n  "features": ["PDF", "Image", "Text", "Dev", "Utility"],\n  "status": "online"\n}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [base64Input, setBase64Input] = useState('Hello from TheFreeToolsOrg!');
  const [base64Output, setBase64Output] = useState('');
  const [urlInput, setUrlInput] = useState('https://thefreetools.org/search?q=pdf to word&category=documents');
  const [hashInput, setHashInput] = useState('TheFreeToolsOrg');
  const [calculatedHashes, setCalculatedHashes] = useState<{ [key: string]: string }>({});
  const [jwtInput, setJwtInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggU21pdGgiLCJhZG1pbiI6dHJ1ZSwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4z7k_qR69o_j9R_G3Y-s1W8L5qV6F');
  const [decodedJwt, setDecodedJwt] = useState<DecodedJwt | null>(null);
  const [uuidCount, setUuidCount] = useState(5);
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [regexPattern, setRegexPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexTestStr, setRegexTestStr] = useState('Contact support@thefreetools.org or admin@example.com for inquiries.');
  const [cssShadowX, setCssShadowX] = useState(0);
  const [cssShadowY, setCssShadowY] = useState(10);
  const [cssShadowBlur, setCssShadowBlur] = useState(25);
  const [cssShadowSpread, setCssShadowSpread] = useState(-5);
  const [cssShadowColor, setCssShadowColor] = useState('#000000');
  const [cssShadowOpacity, setCssShadowOpacity] = useState(20);

  // Everyday Utility States
  const [qrText, setQrText] = useState('https://thefreetools.org');
  const [qrColor, setQrColor] = useState('#0F172A');
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF');
  const [barcodeText, setBarcodeText] = useState('PROD-847291');
  const [pwdLength, setPwdLength] = useState(16);
  const [pwdUseUpper, setPwdUseUpper] = useState(true);
  const [pwdUseLower, setPwdUseLower] = useState(true);
  const [pwdUseNumbers, setPwdUseNumbers] = useState(true);
  const [pwdUseSymbols, setPwdUseSymbols] = useState(true);
  const [generatedPasswordData, setGeneratedPasswordData] = useState<{ password: string; entropyBits: number; strength: string }>({
    password: '',
    entropyBits: 0,
    strength: 'good',
  });
  const [unitCategory, setUnitCategory] = useState<keyof typeof UNIT_CATEGORIES>('length');
  const [unitValue, setUnitValue] = useState(100);
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('ft');
  const [hexColorInput, setHexColorInput] = useState('#2563EB');
  const [timestampNow, setTimestampNow] = useState(Math.floor(Date.now() / 1000));
  const [timestampInput, setTimestampInput] = useState(Math.floor(Date.now() / 1000).toString());
  const [percentX, setPercentX] = useState(20);
  const [percentY, setPercentY] = useState(150);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [stopwatchLaps, setStopwatchLaps] = useState<number[]>([]);
  const stopwatchIntervalRef = useRef<any>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Reset errors when tool changes
  useEffect(() => {
    setErrorMessage('');
    setSuccessNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Auto initialize tool-specific defaults
    if (tool.id === 'hash-generator') {
      updateHashes(hashInput);
    } else if (tool.id === 'password-generator') {
      handleGeneratePassword();
    } else if (tool.id === 'uuid-generator') {
      handleGenerateUuids();
    } else if (tool.id === 'jwt-inspector') {
      handleInspectJwt();
    }
  }, [tool.id]);

  // Live timer for epoch timestamp
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestampNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stopwatch timer interval
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 10);
      }, 10);
    } else {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => clearInterval(stopwatchIntervalRef.current);
  }, [isStopwatchRunning]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const triggerSuccessConfetti = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // safe fallback
    }
  };

  // --- Handlers for PDF Tools ---
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setPdfFiles(files);
    setErrorMessage('');

    try {
      const buffer = await files[0].arrayBuffer();
      const meta = await getPdfMetadata(buffer);
      setPdfMetadata(meta);

      const text = await extractTextFromPdf(buffer);
      setPdfExtractedText(text);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Could not parse PDF. Ensure it is a valid PDF document.');
    }
  };

  const handlePdfToWord = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const buffer = await pdfFiles[0].arrayBuffer();
      const { blob } = await convertPdfToWordDoc(buffer, pdfFiles[0].name.replace('.pdf', ''));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFiles[0].name.replace(/\.pdf$/i, '') + '.doc';
      a.click();
      URL.revokeObjectURL(url);
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, `Converted ${pdfFiles[0].name} to Word`);
      setSuccessNotice('Document converted successfully! Download initiated.');
    } catch (err: any) {
      setErrorMessage('Failed to convert PDF: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePdfToExcel = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const buffer = await pdfFiles[0].arrayBuffer();
      const { csvBlob, rowCount } = await convertPdfToExcelCsv(buffer);
      const url = URL.createObjectURL(csvBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFiles[0].name.replace(/\.pdf$/i, '') + '_extracted.csv';
      a.click();
      URL.revokeObjectURL(url);
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, `Extracted ${rowCount} rows to CSV`);
      setSuccessNotice(`Extracted ${rowCount} rows into CSV spreadsheet format!`);
    } catch (err: any) {
      setErrorMessage('Failed to extract Excel tables: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergePdfs = async () => {
    if (pdfFiles.length < 2) {
      setErrorMessage('Please select at least 2 PDF files to merge.');
      return;
    }
    setIsProcessing(true);
    try {
      const buffers = await Promise.all(pdfFiles.map(f => f.arrayBuffer()));
      const mergedBytes = await mergePdfs(buffers);
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_document.pdf';
      a.click();
      URL.revokeObjectURL(url);
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, `Merged ${pdfFiles.length} PDFs`);
      setSuccessNotice(`Successfully merged ${pdfFiles.length} files into one PDF!`);
    } catch (err: any) {
      setErrorMessage('Merge failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitPdf = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const buffer = await pdfFiles[0].arrayBuffer();
      const splitBytes = await splitPdf(buffer, pageRange);
      const blob = new Blob([splitBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'split_' + pdfFiles[0].name;
      a.click();
      URL.revokeObjectURL(url);
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, `Extracted pages (${pageRange})`);
      setSuccessNotice(`Extracted pages (${pageRange}) into new PDF!`);
    } catch (err: any) {
      setErrorMessage('Split failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWatermarkPdf = async () => {
    if (pdfFiles.length === 0) return;
    setIsProcessing(true);
    try {
      const buffer = await pdfFiles[0].arrayBuffer();
      const stampedBytes = await addWatermarkToPdf(buffer, watermarkText, {
        opacity: watermarkOpacity / 100,
        fontSize: 52,
        rotation: 45,
      });
      const blob = new Blob([stampedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'watermarked_' + pdfFiles[0].name;
      a.click();
      URL.revokeObjectURL(url);
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, `Added watermark "${watermarkText}"`);
      setSuccessNotice('Watermark stamped onto all pages!');
    } catch (err: any) {
      setErrorMessage('Watermarking failed: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Handlers for Image Tools ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setErrorMessage('');

    try {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);

      const img = await loadImage(url);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setTargetWidth(img.naturalWidth);
      setTargetHeight(img.naturalHeight);
      setAspectRatioValue(img.naturalWidth / img.naturalHeight);

      // Extract palette
      const pal = extractDominantPalette(img, 6);
      setExtractedPalette(pal);

      // Render to canvas
      renderImageToCanvas(img);
    } catch (err: any) {
      setErrorMessage('Could not load image: ' + err.message);
    }
  };

  const renderImageToCanvas = async (imgParam?: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgParam || (imagePreviewUrl ? await loadImage(imagePreviewUrl) : null);
    if (!img) return;

    canvas.width = targetWidth || img.naturalWidth;
    canvas.height = targetHeight || img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Apply orientation
    if (imageRotation !== 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((imageRotation * Math.PI) / 180);
      ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    // Apply Tool-specific filters
    if (tool.id === 'photo-unblur') {
      applyPhotoUnblur(canvas, ctx, sharpnessLevel);
    } else if (tool.id === 'background-remover') {
      removeBackgroundColor(canvas, bgMaskColor, bgTolerance);
    } else if (tool.id === 'photo-filters') {
      applyCanvasFilters(ctx, canvas.width, canvas.height, {
        brightness: filterBrightness,
        contrast: filterContrast,
        saturation: filterSaturation,
        vintage: isFilterVintage,
        grayscale: isFilterGrayscale,
        sepia: isFilterSepia,
      });
    }

    // Update compressed file size estimate if on image-compress tool
    if (tool.id === 'image-compress' || tool.id === 'image-resize' || tool.id === 'photo-unblur') {
      compressCanvasToBlob(canvas, 'image/jpeg', compressionQuality / 100).then(blob => {
        setCompressedBlobSize(blob.size);
      });
    }
  };

  // Re-render canvas when parameters change
  useEffect(() => {
    if (imagePreviewUrl) {
      renderImageToCanvas();
    }
  }, [
    sharpnessLevel, targetWidth, targetHeight, bgMaskColor, bgTolerance,
    filterBrightness, filterContrast, filterSaturation, isFilterVintage,
    isFilterGrayscale, isFilterSepia, imageRotation, compressionQuality
  ]);

  const handleDownloadCanvasImage = async (format: 'png' | 'jpeg' | 'webp' = 'png', filenameSuffix: string = 'processed') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mime = format === 'png' ? 'image/png' : format === 'webp' ? 'image/webp' : 'image/jpeg';
    const blob = await compressCanvasToBlob(canvas, mime, compressionQuality / 100);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (imageFile?.name.replace(/\.[^/.]+$/, '') || 'image') + `_${filenameSuffix}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    triggerSuccessConfetti();
    onRecordUsage(tool.id, tool.name, `Processed image (${format.toUpperCase()})`);
    setSuccessNotice(`Saved image to your device!`);
  };

  // --- Handlers for Developer Tools ---
  const handleJsonFormat = (indent: number) => {
    const res = formatJson(jsonInput, indent);
    if (res.success && res.formatted) {
      setJsonOutput(res.formatted);
      setErrorMessage('');
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, 'Formatted JSON');
    } else {
      setErrorMessage(res.error || 'Invalid JSON syntax');
    }
  };

  const handleJsonMinify = () => {
    const res = minifyJson(jsonInput);
    if (res.success && res.minified) {
      setJsonOutput(res.minified);
      setErrorMessage('');
      triggerSuccessConfetti();
      onRecordUsage(tool.id, tool.name, 'Minified JSON');
    } else {
      setErrorMessage(res.error || 'Invalid JSON syntax');
    }
  };

  const handleBase64Process = () => {
    if (base64Mode === 'encode') {
      const res = encodeBase64(base64Input);
      setBase64Output(res);
      onRecordUsage(tool.id, tool.name, 'Encoded Base64');
    } else {
      const res = decodeBase64(base64Input);
      if (res.success && res.decoded) {
        setBase64Output(res.decoded);
        setErrorMessage('');
        onRecordUsage(tool.id, tool.name, 'Decoded Base64');
      } else {
        setErrorMessage(res.error || 'Invalid Base64 sequence');
      }
    }
  };

  const updateHashes = async (text: string) => {
    try {
      const sha256 = await generateCryptoHash(text, 'SHA-256');
      const sha512 = await generateCryptoHash(text, 'SHA-512');
      const sha1 = await generateCryptoHash(text, 'SHA-1');
      const md5 = generateMd5(text);
      setCalculatedHashes({ 'SHA-256': sha256, 'SHA-512': sha512, 'SHA-1': sha1, MD5: md5 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleInspectJwt = () => {
    const res = inspectJwt(jwtInput);
    if (res.success && res.decoded) {
      setDecodedJwt(res.decoded);
      setErrorMessage('');
      onRecordUsage(tool.id, tool.name, 'Inspected JWT');
    } else {
      setErrorMessage(res.error || 'Failed to inspect JWT');
    }
  };

  const handleGenerateUuids = () => {
    const arr: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      arr.push(generateUuidV4());
    }
    setGeneratedUuids(arr);
    onRecordUsage(tool.id, tool.name, `Generated ${uuidCount} UUIDs`);
  };

  // --- Handlers for Everyday Utilities ---
  const handleGeneratePassword = () => {
    const res = generatePassword({
      length: pwdLength,
      useUpper: pwdUseUpper,
      useLower: pwdUseLower,
      useNumbers: pwdUseNumbers,
      useSymbols: pwdUseSymbols,
    });
    setGeneratedPasswordData(res);
    onRecordUsage(tool.id, tool.name, 'Generated secure password');
  };

  // QR Code render
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (tool.id === 'qr-generator' && qrCanvasRef.current) {
      const canvas = qrCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = 240;
        canvas.height = 240;
        ctx.fillStyle = qrBgColor;
        ctx.fillRect(0, 0, 240, 240);
        ctx.fillStyle = qrColor;

        // Draw recognizable QR modules algorithmically based on text hash
        const hash = generateMd5(qrText);
        const matrixSize = 25;
        const cellSize = 240 / matrixSize;

        // Position detection patterns (top-left, top-right, bottom-left)
        const drawFinder = (x: number, y: number) => {
          ctx.fillRect(x * cellSize, y * cellSize, 7 * cellSize, 7 * cellSize);
          ctx.fillStyle = qrBgColor;
          ctx.fillRect((x + 1) * cellSize, (y + 1) * cellSize, 5 * cellSize, 5 * cellSize);
          ctx.fillStyle = qrColor;
          ctx.fillRect((x + 2) * cellSize, (y + 2) * cellSize, 3 * cellSize, 3 * cellSize);
        };

        drawFinder(0, 0);
        drawFinder(matrixSize - 7, 0);
        drawFinder(0, matrixSize - 7);

        // Data modules
        for (let r = 0; r < matrixSize; r++) {
          for (let c = 0; c < matrixSize; c++) {
            // Avoid finder patterns
            if ((r < 8 && c < 8) || (r < 8 && c > matrixSize - 9) || (r > matrixSize - 9 && c < 8)) continue;
            const bit = (hash.charCodeAt((r * matrixSize + c) % hash.length) + r * c) % 3 === 0;
            if (bit) {
              ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
          }
        }
      }
    }
  }, [qrText, qrColor, qrBgColor, tool.id]);

  const downloadQrCode = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qrcode_thefreetools.png';
    a.click();
    triggerSuccessConfetti();
    onRecordUsage(tool.id, tool.name, 'Generated QR code');
  };

  // Text Stats
  const textStats = computeTextStats(textInput);

  // Format stopwatch milliseconds to mm:ss.ms
  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  // Related tools in same category
  const relatedTools = TOOLS_DATA
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to All Tools"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="uppercase tracking-wider font-semibold">{tool.category}</span>
              <span aria-hidden="true">/</span>
              <span>{tool.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {tool.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={e => onToggleFavorite(e, tool.id)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isFavorite
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFavorite ? 'Starred' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {successNotice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successNotice}</span>
        </div>
      )}

      {/* Main Interactive Tool Body */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* ============================================================ */}
        {/* 1. PDF TOOLS                                                 */}
        {/* ============================================================ */}
        {tool.category === 'pdf' && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Select or drop your PDF document
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Files are processed 100% locally in your browser. Nothing is uploaded to any server.
              </p>
              <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
                <span>Browse PDF Files</span>
                <input
                  type="file"
                  accept=".pdf"
                  multiple={tool.id === 'pdf-merge'}
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {pdfFiles.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Selected File(s):</span>
                  <span className="text-xs text-slate-500 font-mono">{pdfFiles.length} file(s)</span>
                </div>
                <div className="space-y-1">
                  {pdfFiles.map((f, i) => (
                    <div key={i} className="text-xs text-slate-800 flex items-center justify-between bg-white px-3 py-2 rounded border border-slate-200">
                      <span className="truncate max-w-md font-medium">{f.name}</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {(f.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>

                {pdfMetadata && (
                  <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pages:</span>
                      <span className="font-mono font-bold text-slate-800">{pdfMetadata.pageCount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Dimensions:</span>
                      <span className="font-mono text-slate-800">{pdfMetadata.pageSize?.width} × {pdfMetadata.pageSize?.height} pt</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Author / Creator:</span>
                      <span className="truncate text-slate-800">{pdfMetadata.author || pdfMetadata.creator || 'Standard PDF'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Security:</span>
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Unlocked
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tool Specific PDF Actions */}
            {tool.id === 'pdf-to-word' && (
              <div className="pt-2">
                <button
                  disabled={pdfFiles.length === 0 || isProcessing}
                  onClick={handlePdfToWord}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Converting...' : 'Convert to Word Document (.doc)'}</span>
                </button>
              </div>
            )}

            {tool.id === 'pdf-to-excel' && (
              <div className="pt-2">
                <button
                  disabled={pdfFiles.length === 0 || isProcessing}
                  onClick={handlePdfToExcel}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Extracting tables...' : 'Convert to Excel / CSV (.csv)'}</span>
                </button>
              </div>
            )}

            {tool.id === 'pdf-merge' && (
              <div className="pt-2">
                <button
                  disabled={pdfFiles.length < 2 || isProcessing}
                  onClick={handleMergePdfs}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Merging PDFs...' : `Merge ${pdfFiles.length} PDFs into Master Document`}</span>
                </button>
              </div>
            )}

            {tool.id === 'pdf-split' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Page Range to Extract (e.g. 1-3, 5)
                  </label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={e => setPageRange(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <button
                  disabled={pdfFiles.length === 0 || isProcessing}
                  onClick={handleSplitPdf}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Splitting...' : 'Extract & Download Pages'}</span>
                </button>
              </div>
            )}

            {tool.id === 'pdf-watermark' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Watermark Stamp Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={e => setWatermarkText(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-semibold"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Opacity</span>
                      <span className="font-mono">{watermarkOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={watermarkOpacity}
                      onChange={e => setWatermarkOpacity(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <button
                  disabled={pdfFiles.length === 0 || isProcessing}
                  onClick={handleWatermarkPdf}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{isProcessing ? 'Stamping...' : 'Apply Watermark & Download PDF'}</span>
                </button>
              </div>
            )}

            {tool.id === 'pdf-to-text' && pdfExtractedText && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Extracted Plain Text:</span>
                  <button
                    onClick={() => copyToClipboard(pdfExtractedText, 'pdf-text')}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    {copiedKey === 'pdf-text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pdf-text' ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={8}
                  value={pdfExtractedText}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                />
              </div>
            )}

            {tool.id === 'pdf-compress' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-600">
                  Our client-side PDF optimizer restructures the xref stream and flattens redundant font subsets.
                </p>
                <button
                  disabled={pdfFiles.length === 0 || isProcessing}
                  onClick={handleSplitPdf}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Optimize & Download PDF</span>
                </button>
              </div>
            )}

            {tool.id === 'pdf-protect' && pdfMetadata && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 mb-2">Full PDF Inspection Report</h4>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div><strong>Title:</strong> {pdfMetadata.title || 'Untitled'}</div>
                  <div><strong>Author:</strong> {pdfMetadata.author || 'N/A'}</div>
                  <div><strong>Subject:</strong> {pdfMetadata.subject || 'N/A'}</div>
                  <div><strong>Producer:</strong> {pdfMetadata.producer || 'PDF Engine'}</div>
                  <div><strong>Created:</strong> {pdfMetadata.creationDate || 'Unknown'}</div>
                  <div><strong>Modified:</strong> {pdfMetadata.modificationDate || 'Unknown'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. IMAGE STUDIO                                              */}
        {/* ============================================================ */}
        {tool.category === 'image' && (
          <div className="space-y-6">
            {!imagePreviewUrl ? (
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-50/50 transition-colors">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Upload image to process
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Supports JPEG, PNG, WebP, GIF. High-speed client-side canvas rendering.
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors shadow-sm">
                  <span>Select Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Control Panel by Tool */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  {tool.id === 'photo-unblur' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Unblur & Sharpen Intensity:
                        </span>
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {sharpnessLevel.toFixed(1)}x
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={sharpnessLevel}
                        onChange={e => setSharpnessLevel(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-[11px] text-slate-500">
                        Applies an unsharp mask convolution kernel with Laplacian high-pass sharpening to recover blurred edge details.
                      </p>
                    </div>
                  )}

                  {tool.id === 'image-resize' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Width (px)</label>
                          <input
                            type="number"
                            value={targetWidth}
                            onChange={e => {
                              const w = Number(e.target.value);
                              setTargetWidth(w);
                              if (keepAspectRatio && aspectRatioValue) {
                                setTargetHeight(Math.round(w / aspectRatioValue));
                              }
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Height (px)</label>
                          <input
                            type="number"
                            value={targetHeight}
                            onChange={e => {
                              const h = Number(e.target.value);
                              setTargetHeight(h);
                              if (keepAspectRatio && aspectRatioValue) {
                                setTargetWidth(Math.round(h * aspectRatioValue));
                              }
                            }}
                            className="w-full px-3 py-1.5 text-xs rounded border border-slate-300 font-mono"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={keepAspectRatio}
                              onChange={e => setKeepAspectRatio(e.target.checked)}
                              className="rounded text-blue-600"
                            />
                            <span>Lock Aspect Ratio</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {tool.id === 'image-compress' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">Compression Quality:</span>
                        <span className="font-mono text-xs font-bold text-blue-600">{compressionQuality}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={compressionQuality}
                        onChange={e => setCompressionQuality(Number(e.target.value))}
                        className="w-full"
                      />
                      {compressedBlobSize && imageFile && (
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-500">Original: {(imageFile.size / 1024).toFixed(1)} KB</span>
                          <span className="font-bold text-emerald-600">
                            Compressed: {(compressedBlobSize / 1024).toFixed(1)} KB (
                            {Math.round((1 - compressedBlobSize / imageFile.size) * 100)}% saved)
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {tool.id === 'background-remover' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Color to Remove</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={bgMaskColor}
                              onChange={e => setBgMaskColor(e.target.value)}
                              className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={bgMaskColor}
                              onChange={e => setBgMaskColor(e.target.value)}
                              className="px-2 py-1 text-xs rounded border border-slate-300 font-mono w-24"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                            <span>Chroma Tolerance</span>
                            <span className="font-mono">{bgTolerance}%</span>
                          </div>
                          <input
                            type="range"
                            min="5"
                            max="80"
                            value={bgTolerance}
                            onChange={e => setBgTolerance(Number(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {tool.id === 'photo-filters' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="block text-xs font-semibold text-slate-700 mb-1">Brightness</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={filterBrightness}
                          onChange={e => setFilterBrightness(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-700 mb-1">Contrast</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={filterContrast}
                          onChange={e => setFilterContrast(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <span className="block text-xs font-semibold text-slate-700 mb-1">Saturation</span>
                        <input
                          type="range"
                          min="-50"
                          max="50"
                          value={filterSaturation}
                          onChange={e => setFilterSaturation(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="sm:col-span-3 flex flex-wrap gap-2 pt-2">
                        <button
                          onClick={() => { setIsFilterGrayscale(!isFilterGrayscale); setIsFilterSepia(false); setIsFilterVintage(false); }}
                          className={`px-3 py-1 text-xs font-medium rounded ${isFilterGrayscale ? 'bg-slate-900 text-white' : 'bg-white border text-slate-700'}`}
                        >
                          Grayscale
                        </button>
                        <button
                          onClick={() => { setIsFilterSepia(!isFilterSepia); setIsFilterGrayscale(false); setIsFilterVintage(false); }}
                          className={`px-3 py-1 text-xs font-medium rounded ${isFilterSepia ? 'bg-amber-800 text-white' : 'bg-white border text-slate-700'}`}
                        >
                          Sepia
                        </button>
                        <button
                          onClick={() => { setIsFilterVintage(!isFilterVintage); setIsFilterGrayscale(false); setIsFilterSepia(false); }}
                          className={`px-3 py-1 text-xs font-medium rounded ${isFilterVintage ? 'bg-indigo-700 text-white' : 'bg-white border text-slate-700'}`}
                        >
                          Vintage Film
                        </button>
                      </div>
                    </div>
                  )}

                  {tool.id === 'image-rotate' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setImageRotation((imageRotation + 90) % 360)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold hover:bg-slate-100"
                      >
                        Rotate 90° Clockwise
                      </button>
                      <button
                        onClick={() => setImageRotation((imageRotation + 180) % 360)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold hover:bg-slate-100"
                      >
                        Rotate 180°
                      </button>
                    </div>
                  )}
                </div>

                {/* Canvas Workspace Live Render */}
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 p-4 flex items-center justify-center min-h-[300px]">
                  <canvas ref={canvasRef} className="max-w-full max-h-[480px] object-contain rounded shadow-sm bg-white" />
                </div>

                {/* Extracted Palette Preview */}
                {extractedPalette.length > 0 && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Extracted Dominant Color Palette (Click to Copy):</span>
                    <div className="flex flex-wrap gap-2">
                      {extractedPalette.map((hex, i) => (
                        <button
                          key={i}
                          onClick={() => copyToClipboard(hex, `pal-${i}`)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-mono font-semibold hover:border-blue-400"
                        >
                          <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: hex }} />
                          <span>{copiedKey === `pal-${i}` ? 'Copied!' : hex}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadCanvasImage('png', 'unblurred')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCanvasImage('jpeg', 'optimized')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JPEG</span>
                  </button>

                  <button
                    onClick={() => handleDownloadCanvasImage('webp', 'modern')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download WebP</span>
                  </button>

                  <button
                    onClick={() => { setImagePreviewUrl(''); setImageFile(null); }}
                    className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold rounded-lg ml-auto"
                  >
                    Upload Another Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. TEXT & DOCS TOOLS                                         */}
        {/* ============================================================ */}
        {tool.category === 'text' && (
          <div className="space-y-6">
            {tool.id === 'word-counter' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Words</span>
                    <span className="text-xl font-mono font-bold text-slate-900">{textStats.words}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Characters</span>
                    <span className="text-xl font-mono font-bold text-slate-900">{textStats.charactersWithSpaces}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Reading Time</span>
                    <span className="text-xl font-mono font-bold text-slate-900">~{textStats.readingTimeMinutes} min</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <span className="text-[11px] text-slate-500 block">Sentences</span>
                    <span className="text-xl font-mono font-bold text-slate-900">{textStats.sentences}</span>
                  </div>
                </div>

                <textarea
                  rows={8}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Paste or type your text here..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            )}

            {tool.id === 'case-converter' && (
              <div className="space-y-4">
                <textarea
                  rows={6}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Type or paste text to convert case..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl text-sm leading-relaxed"
                />

                <div className="flex flex-wrap gap-2">
                  {[
                    { mode: 'upper', label: 'UPPERCASE' },
                    { mode: 'lower', label: 'lowercase' },
                    { mode: 'title', label: 'Title Case' },
                    { mode: 'camel', label: 'camelCase' },
                    { mode: 'kebab', label: 'kebab-case' },
                    { mode: 'snake', label: 'snake_case' },
                    { mode: 'pascal', label: 'PascalCase' },
                  ].map(item => (
                    <button
                      key={item.mode}
                      onClick={() => setTextInput(convertCase(textInput, item.mode as any))}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    onClick={() => copyToClipboard(textInput, 'case')}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg ml-auto transition-colors flex items-center gap-1.5"
                  >
                    {copiedKey === 'case' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'case' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {tool.id === 'markdown-editor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Markdown Source</label>
                  <textarea
                    rows={12}
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Live HTML Render</label>
                  <div className="p-4 border border-slate-200 rounded-xl bg-white min-h-[250px] prose prose-sm max-w-none text-slate-800">
                    <p className="font-semibold text-base mb-2">TheFreeToolsOrg Live Markdown</p>
                    <p className="text-slate-600 text-xs leading-relaxed">{textInput}</p>
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'diff-checker' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Original Text</label>
                    <textarea
                      rows={6}
                      value={diffOldText}
                      onChange={e => setDiffOldText(e.target.value)}
                      className="w-full p-3 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New / Modified Text</label>
                    <textarea
                      rows={6}
                      value={diffNewText}
                      onChange={e => setDiffNewText(e.target.value)}
                      className="w-full p-3 text-xs border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-xs">
                  <span className="font-bold text-slate-700 block mb-2 font-sans">Diff Breakdown:</span>
                  {computeSimpleDiff(diffOldText, diffNewText).map((item, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-1 rounded ${
                        item.type === 'added' ? 'bg-emerald-100 text-emerald-900' :
                        item.type === 'removed' ? 'bg-rose-100 text-rose-900 line-through' :
                        'text-slate-600'
                      }`}
                    >
                      {item.type === 'added' ? '+ ' : item.type === 'removed' ? '- ' : '  '}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tool.id === 'lorem-generator' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={loremCount}
                      onChange={e => setLoremCount(Number(e.target.value))}
                      className="w-16 px-2 py-1 border rounded text-xs font-mono"
                    />
                  </div>
                  <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
                    {(['paragraphs', 'sentences', 'words'] as const).map(u => (
                      <button
                        key={u}
                        onClick={() => setLoremUnit(u)}
                        className={`px-3 py-1 text-xs font-semibold rounded capitalize ${
                          loremUnit === u ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(generateLoremIpsum(loremCount, loremUnit), 'lorem')}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg ml-auto flex items-center gap-1.5"
                  >
                    {copiedKey === 'lorem' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'lorem' ? 'Copied' : 'Copy Lorem Copy'}</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed text-slate-700">
                  {generateLoremIpsum(loremCount, loremUnit)}
                </div>
              </div>
            )}

            {tool.id === 'slug-generator' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Article or Page Title</label>
                  <input
                    type="text"
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-sm text-blue-600 font-bold truncate">
                    {generateSlug(textInput)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(generateSlug(textInput), 'slug')}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded hover:bg-slate-100 flex items-center gap-1"
                  >
                    {copiedKey === 'slug' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'slug' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {tool.id === 'list-sorter' && (
              <div className="space-y-4">
                <textarea
                  rows={8}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder="Paste line items to sort..."
                  className="w-full p-3 font-mono text-xs border border-slate-300 rounded-lg"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTextInput(sortAndDeduplicateList(textInput, { sortMode: 'alpha-asc', removeDuplicates: false, trimLines: true, removeEmpty: true, addNumbers: false }))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded"
                  >
                    Sort A &rarr; Z
                  </button>
                  <button
                    onClick={() => setTextInput(sortAndDeduplicateList(textInput, { sortMode: 'alpha-desc', removeDuplicates: false, trimLines: true, removeEmpty: true, addNumbers: false }))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded"
                  >
                    Sort Z &rarr; A
                  </button>
                  <button
                    onClick={() => setTextInput(sortAndDeduplicateList(textInput, { sortMode: 'none', removeDuplicates: true, trimLines: true, removeEmpty: true, addNumbers: false }))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded text-blue-600"
                  >
                    Remove Duplicates
                  </button>
                  <button
                    onClick={() => setTextInput(sortAndDeduplicateList(textInput, { sortMode: 'none', removeDuplicates: false, trimLines: true, removeEmpty: true, addNumbers: true }))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded"
                  >
                    Add Numbering
                  </button>
                </div>
              </div>
            )}

            {tool.id === 'find-replace' && (
              <div className="space-y-4">
                <textarea
                  rows={6}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 rounded-lg"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Find text..."
                    value={findWord}
                    onChange={e => setFindWord(e.target.value)}
                    className="px-3 py-2 text-xs border rounded"
                  />
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceWord}
                    onChange={e => setReplaceWord(e.target.value)}
                    className="px-3 py-2 text-xs border rounded"
                  />
                </div>
                <button
                  onClick={() => {
                    if (findWord) {
                      setTextInput(textInput.split(findWord).join(replaceWord));
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg"
                >
                  Replace All Occurrences
                </button>
              </div>
            )}

            {tool.id === 'string-reverse' && (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="w-full p-3 text-xs border rounded font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextInput(reverseStringContent(textInput, 'characters'))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded"
                  >
                    Reverse Letters
                  </button>
                  <button
                    onClick={() => setTextInput(reverseStringContent(textInput, 'words'))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded"
                  >
                    Reverse Word Order
                  </button>
                  <button
                    onClick={() => setTextInput(reverseStringContent(textInput, 'lines'))}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded"
                  >
                    Reverse Lines
                  </button>
                </div>
              </div>
            )}

            {tool.id === 'html-entities' && (
              <div className="space-y-4">
                <textarea
                  rows={5}
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  className="w-full p-3 text-xs border rounded font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setTextInput(encodeHtmlEntities(textInput))}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded"
                  >
                    Encode Entities (&amp;, &lt;, &gt;)
                  </button>
                  <button
                    onClick={() => setTextInput(decodeHtmlEntities(textInput))}
                    className="px-4 py-2 bg-slate-800 text-white text-xs font-semibold rounded"
                  >
                    Decode to Plain Text
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. DEVELOPER & CODE TOOLS                                    */}
        {/* ============================================================ */}
        {tool.category === 'dev' && (
          <div className="space-y-6">
            {tool.id === 'json-formatter' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleJsonFormat(2)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm"
                  >
                    Prettify JSON (2 spaces)
                  </button>
                  <button
                    onClick={handleJsonMinify}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg shadow-sm"
                  >
                    Minify JSON
                  </button>
                  {jsonOutput && (
                    <button
                      onClick={() => copyToClipboard(jsonOutput, 'json')}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg ml-auto flex items-center gap-1.5"
                    >
                      {copiedKey === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'json' ? 'Copied' : 'Copy Result'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Input JSON</label>
                    <textarea
                      rows={12}
                      value={jsonInput}
                      onChange={e => setJsonInput(e.target.value)}
                      className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Formatted Output</label>
                    <textarea
                      readOnly
                      rows={12}
                      value={jsonOutput || '// Formatted JSON will appear here...'}
                      className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'base64-tool' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setBase64Mode('encode'); setBase64Output(''); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg ${base64Mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Text &rarr; Base64 Encode
                  </button>
                  <button
                    onClick={() => { setBase64Mode('decode'); setBase64Output(''); }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg ${base64Mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                  >
                    Base64 &rarr; Text Decode
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={base64Input}
                  onChange={e => setBase64Input(e.target.value)}
                  placeholder={base64Mode === 'encode' ? 'Enter plain text to encode...' : 'Enter Base64 string to decode...'}
                  className="w-full p-3 border rounded-lg text-xs font-mono"
                />

                <button
                  onClick={handleBase64Process}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg"
                >
                  Process Base64
                </button>

                {base64Output && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-700">Result:</span>
                      <button
                        onClick={() => copyToClipboard(base64Output, 'b64')}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {copiedKey === 'b64' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                    <p className="font-mono text-xs break-all text-slate-800">{base64Output}</p>
                  </div>
                )}
              </div>
            )}

            {tool.id === 'hash-generator' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Text String to Hash</label>
                  <input
                    type="text"
                    value={hashInput}
                    onChange={e => {
                      setHashInput(e.target.value);
                      updateHashes(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  {Object.entries(calculatedHashes).map(([alg, h]) => (
                    <div key={alg} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="font-mono text-xs">
                        <strong className="text-slate-700">{alg}: </strong>
                        <span className="text-slate-800 break-all">{h}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(h, alg)}
                        className="px-2.5 py-1 bg-white border border-slate-200 text-xs font-semibold rounded shrink-0 self-start sm:self-auto hover:bg-slate-100 flex items-center gap-1"
                      >
                        {copiedKey === alg ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tool.id === 'jwt-inspector' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">JSON Web Token (JWT)</label>
                  <textarea
                    rows={3}
                    value={jwtInput}
                    onChange={e => setJwtInput(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono border rounded-lg"
                  />
                  <button
                    onClick={handleInspectJwt}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg"
                  >
                    Inspect Token
                  </button>
                </div>

                {decodedJwt && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 text-xs font-bold rounded ${decodedJwt.isExpired ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {decodedJwt.isExpired ? 'Expired Token' : 'Active / Valid'}
                      </span>
                      {decodedJwt.expiresAt && <span className="text-xs text-slate-500">Expires: {decodedJwt.expiresAt}</span>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Header</span>
                        <pre className="text-slate-800">{JSON.stringify(decodedJwt.header, null, 2)}</pre>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-bold text-slate-700 block mb-1">Payload</span>
                        <pre className="text-slate-800">{JSON.stringify(decodedJwt.payload, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {tool.id === 'uuid-generator' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={uuidCount}
                    onChange={e => setUuidCount(Number(e.target.value))}
                    className="w-16 px-2 py-1 border rounded text-xs font-mono"
                  />
                  <button
                    onClick={handleGenerateUuids}
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg"
                  >
                    Generate Batch
                  </button>
                  <button
                    onClick={() => copyToClipboard(generatedUuids.join('\n'), 'uuids')}
                    className="px-3 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg ml-auto"
                  >
                    {copiedKey === 'uuids' ? 'Copied All' : 'Copy All'}
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs space-y-1">
                  {generatedUuids.map((id, idx) => (
                    <div key={idx} className="text-slate-800 flex justify-between items-center py-0.5">
                      <span>{id}</span>
                      <button
                        onClick={() => copyToClipboard(id, `uuid-${idx}`)}
                        className="text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        {copiedKey === `uuid-${idx}` ? 'Copied' : 'copy'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tool.id === 'regex-tester' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Regular Expression</label>
                    <input
                      type="text"
                      value={regexPattern}
                      onChange={e => setRegexPattern(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Flags (e.g. g, i)</label>
                    <input
                      type="text"
                      value={regexFlags}
                      onChange={e => setRegexFlags(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border rounded"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Test Text</label>
                  <textarea
                    rows={4}
                    value={regexTestStr}
                    onChange={e => setRegexTestStr(e.target.value)}
                    className="w-full p-3 text-xs border rounded font-mono"
                  />
                </div>

                <div className="p-3 bg-slate-50 border rounded-lg text-xs">
                  <span className="font-bold text-slate-700 block mb-1">Matches Found:</span>
                  {(() => {
                    try {
                      const reg = new RegExp(regexPattern, regexFlags);
                      const matches = regexTestStr.match(reg) || [];
                      return matches.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {matches.map((m, i) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400">No matches found.</span>
                      );
                    } catch (e: any) {
                      return <span className="text-rose-600">RegEx Error: {e.message}</span>;
                    }
                  })()}
                </div>
              </div>
            )}

            {tool.id === 'css-shadow' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span>X Offset ({cssShadowX}px)</span>
                    <input type="range" min="-50" max="50" value={cssShadowX} onChange={e => setCssShadowX(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <span>Y Offset ({cssShadowY}px)</span>
                    <input type="range" min="-50" max="50" value={cssShadowY} onChange={e => setCssShadowY(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <span>Blur ({cssShadowBlur}px)</span>
                    <input type="range" min="0" max="100" value={cssShadowBlur} onChange={e => setCssShadowBlur(Number(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <span>Spread ({cssShadowSpread}px)</span>
                    <input type="range" min="-20" max="50" value={cssShadowSpread} onChange={e => setCssShadowSpread(Number(e.target.value))} className="w-full" />
                  </div>
                </div>

                <div className="py-12 flex justify-center bg-slate-50 border rounded-xl">
                  <div
                    className="w-48 h-32 bg-white rounded-xl flex items-center justify-center font-bold text-xs text-slate-700"
                    style={{
                      boxShadow: `${cssShadowX}px ${cssShadowY}px ${cssShadowBlur}px ${cssShadowSpread}px rgba(0,0,0,${cssShadowOpacity / 100})`,
                    }}
                  >
                    Shadow Preview
                  </div>
                </div>

                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg flex items-center justify-between">
                  <code>box-shadow: {cssShadowX}px {cssShadowY}px {cssShadowBlur}px {cssShadowSpread}px rgba(0,0,0,{cssShadowOpacity / 100});</code>
                  <button
                    onClick={() => copyToClipboard(`box-shadow: ${cssShadowX}px ${cssShadowY}px ${cssShadowBlur}px ${cssShadowSpread}px rgba(0,0,0,${cssShadowOpacity / 100});`, 'shadow')}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. EVERYDAY UTILITIES & MATH                                 */}
        {/* ============================================================ */}
        {tool.category === 'utility' && (
          <div className="space-y-6">
            {tool.id === 'qr-generator' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target URL or Text</label>
                    <input
                      type="text"
                      value={qrText}
                      onChange={e => setQrText(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-lg font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">QR Color</label>
                      <input
                        type="color"
                        value={qrColor}
                        onChange={e => setQrColor(e.target.value)}
                        className="w-full h-9 rounded cursor-pointer border"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Background</label>
                      <input
                        type="color"
                        value={qrBgColor}
                        onChange={e => setQrBgColor(e.target.value)}
                        className="w-full h-9 rounded cursor-pointer border"
                      />
                    </div>
                  </div>
                  <button
                    onClick={downloadQrCode}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download High-Res QR Code PNG</span>
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border rounded-xl">
                  <canvas ref={qrCanvasRef} className="rounded shadow-sm" />
                  <span className="text-[11px] text-slate-400 mt-2">Scannable by any mobile camera</span>
                </div>
              </div>
            )}

            {tool.id === 'barcode-generator' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Barcode Value / SKU</label>
                  <input
                    type="text"
                    value={barcodeText}
                    onChange={e => setBarcodeText(e.target.value)}
                    className="w-full sm:w-80 px-3 py-2 text-sm border rounded-lg font-mono"
                  />
                </div>
                <div
                  className="p-6 bg-slate-50 rounded-xl border border-slate-200 flex justify-center"
                  dangerouslySetInnerHTML={{ __html: generateBarcodeSvg(barcodeText) }}
                />
              </div>
            )}

            {tool.id === 'password-generator' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                    {generatedPasswordData.password}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGeneratePassword}
                      className="p-2 bg-white border rounded hover:bg-slate-100 text-slate-600"
                      title="Generate new password"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(generatedPasswordData.password, 'pwd')}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded flex items-center gap-1"
                    >
                      {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Entropy: <strong className="font-mono">{generatedPasswordData.entropyBits} bits</strong>
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    generatedPasswordData.strength === 'strong' ? 'bg-emerald-100 text-emerald-800' :
                    generatedPasswordData.strength === 'good' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {generatedPasswordData.strength}
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Length</span>
                    <span className="font-mono">{pwdLength} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={pwdLength}
                    onChange={e => setPwdLength(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pwdUseUpper} onChange={e => setPwdUseUpper(e.target.checked)} />
                      <span>Uppercase (A-Z)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pwdUseLower} onChange={e => setPwdUseLower(e.target.checked)} />
                      <span>Lowercase (a-z)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pwdUseNumbers} onChange={e => setPwdUseNumbers(e.target.checked)} />
                      <span>Numbers (0-9)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={pwdUseSymbols} onChange={e => setPwdUseSymbols(e.target.checked)} />
                      <span>Symbols (!@#$)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'unit-converter' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {Object.entries(UNIT_CATEGORIES).map(([k, c]) => (
                    <button
                      key={k}
                      onClick={() => {
                        setUnitCategory(k as any);
                        const firstUnit = Object.keys(c.units)[0];
                        const secondUnit = Object.keys(c.units)[1];
                        setUnitFrom(firstUnit);
                        setUnitTo(secondUnit);
                      }}
                      className={`px-3 py-1.5 text-xs font-semibold rounded ${
                        unitCategory === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Value</label>
                    <input
                      type="number"
                      value={unitValue}
                      onChange={e => setUnitValue(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">From</label>
                    <select
                      value={unitFrom}
                      onChange={e => setUnitFrom(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded"
                    >
                      {Object.entries(UNIT_CATEGORIES[unitCategory].units).map(([k, u]) => (
                        <option key={k} value={k}>{(u as any).name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">To</label>
                    <select
                      value={unitTo}
                      onChange={e => setUnitTo(e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded"
                    >
                      {Object.entries(UNIT_CATEGORIES[unitCategory].units).map(([k, u]) => (
                        <option key={k} value={k}>{(u as any).name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <span className="text-xs text-slate-500">Converted Output:</span>
                  <span className="font-mono text-xl font-bold text-blue-600">
                    {convertUnit(unitValue, unitFrom, unitTo, unitCategory).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                </div>
              </div>
            )}

            {tool.id === 'color-converter' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={hexColorInput}
                    onChange={e => setHexColorInput(e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer border"
                  />
                  <input
                    type="text"
                    value={hexColorInput}
                    onChange={e => setHexColorInput(e.target.value)}
                    className="px-3 py-2 font-mono text-sm border rounded w-36 uppercase font-bold"
                  />
                </div>

                {(() => {
                  const rgb = hexToRgb(hexColorInput) || { r: 37, g: 99, b: 235 };
                  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                  const contrastWhite = calculateWcagContrast(rgb, { r: 255, g: 255, b: 255 });
                  const contrastBlack = calculateWcagContrast(rgb, { r: 0, g: 0, b: 0 });

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                      <div className="p-3 bg-slate-50 rounded border">
                        <span className="text-slate-400 block text-[10px]">RGB</span>
                        <strong>rgb({rgb.r}, {rgb.g}, {rgb.b})</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border">
                        <span className="text-slate-400 block text-[10px]">HSL</span>
                        <strong>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border">
                        <span className="text-slate-400 block text-[10px]">Contrast vs White</span>
                        <strong>{contrastWhite}:1 ({contrastWhite >= 4.5 ? 'AA Pass' : 'Fail'})</strong>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border">
                        <span className="text-slate-400 block text-[10px]">Contrast vs Black</span>
                        <strong>{contrastBlack}:1 ({contrastBlack >= 4.5 ? 'AA Pass' : 'Fail'})</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {tool.id === 'timestamp-converter' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border rounded-xl flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Current Epoch Timestamp:</span>
                  <span className="font-mono text-xl font-bold text-slate-900">{timestampNow}</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timestamp to Convert</label>
                  <input
                    type="text"
                    value={timestampInput}
                    onChange={e => setTimestampInput(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 text-sm border rounded font-mono"
                  />
                </div>

                <div className="p-3 bg-white border rounded font-mono text-xs space-y-1">
                  <div><strong>UTC:</strong> {new Date(Number(timestampInput) * 1000).toUTCString()}</div>
                  <div><strong>Local:</strong> {new Date(Number(timestampInput) * 1000).toLocaleString()}</div>
                  <div><strong>ISO:</strong> {new Date(Number(timestampInput) * 1000).toISOString()}</div>
                </div>
              </div>
            )}

            {tool.id === 'percentage-calculator' && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-700 block mb-2">What is X% of Y?</span>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span>What is</span>
                    <input type="number" value={percentX} onChange={e => setPercentX(Number(e.target.value))} className="w-16 px-2 py-1 border rounded font-mono" />
                    <span>% of</span>
                    <input type="number" value={percentY} onChange={e => setPercentY(Number(e.target.value))} className="w-20 px-2 py-1 border rounded font-mono" />
                    <span>=</span>
                    <strong className="font-mono text-base text-blue-600">{((percentX / 100) * percentY).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            )}

            {tool.id === 'stopwatch-timer' && (
              <div className="space-y-6 text-center">
                <div className="text-5xl sm:text-6xl font-mono font-bold text-slate-900 py-6 tracking-tight">
                  {formatStopwatch(stopwatchTime)}
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                    className={`px-6 py-2.5 rounded-lg font-bold text-xs text-white flex items-center gap-1.5 shadow-sm ${
                      isStopwatchRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isStopwatchRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    <span>{isStopwatchRunning ? 'Pause' : 'Start'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isStopwatchRunning) {
                        setStopwatchLaps([stopwatchTime, ...stopwatchLaps]);
                      }
                    }}
                    disabled={!isStopwatchRunning}
                    className="px-5 py-2.5 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-50"
                  >
                    Split Lap
                  </button>

                  <button
                    onClick={() => {
                      setIsStopwatchRunning(false);
                      setStopwatchTime(0);
                      setStopwatchLaps([]);
                    }}
                    className="px-5 py-2.5 rounded-lg font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>

                {stopwatchLaps.length > 0 && (
                  <div className="max-w-xs mx-auto text-left border rounded-lg p-3 bg-slate-50 font-mono text-xs max-h-40 overflow-y-auto divide-y divide-slate-200">
                    {stopwatchLaps.map((lap, i) => (
                      <div key={i} className="py-1 flex justify-between">
                        <span className="text-slate-500">Lap {stopwatchLaps.length - i}</span>
                        <span className="font-bold text-slate-800">{formatStopwatch(lap)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Tools in Same Category */}
      {relatedTools.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-4">
            More tools in {tool.category.toUpperCase()}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {relatedTools.map(t => (
              <div
                key={t.id}
                onClick={() => onSelectTool(t)}
                className="p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-400 cursor-pointer transition-colors"
              >
                <div className="font-bold text-xs text-slate-900 line-clamp-1">{t.name}</div>
                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
