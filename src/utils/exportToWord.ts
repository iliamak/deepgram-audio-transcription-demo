import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Экспортирует текст в документ Word (.docx)
 * @param text Текст для экспорта
 * @param filename Имя файла (без расширения)
 */
export const exportToWord = async (text: string, filename: string = 'transcription'): Promise<boolean> => {
  try {
    // Создаем параграфы для документа
    const paragraphs = text.split('\n\n').map(paragraph => {
      return new Paragraph({
        children: [
          new TextRun({
            text: paragraph,
            size: 24, // Размер шрифта (в половинных пунктах: 24 = 12pt)
          }),
        ],
        spacing: {
          after: 200, // Отступ после абзаца
        },
      });
    });

    // Создаем документ
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    // Генерируем docx файл
    const buffer = await Packer.toBlob(doc);
    
    // Сохраняем файл
    saveAs(buffer, `${filename}.docx`);
    
    return true;
  } catch (error) {
    console.error('Ошибка при экспорте в Word:', error);
    return false;
  }
};
