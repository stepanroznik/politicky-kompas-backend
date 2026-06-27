import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname);
const seedPath = path.join(
    repoRoot,
    'apps/api/src/calculator-2026/seed/calculator-2026.seed.json',
);
const outputPath = path.resolve(
    process.argv[2] ??
        path.join(repoRoot, 'tmp/calculator-2026-current-data.xlsx'),
);

const seed = JSON.parse(await fs.readFile(seedPath, 'utf8'));
const partyOrder = [
    'ANO',
    'SPOLU',
    'STAN',
    'PIRATI',
    'SPD',
    'MOTORISTE',
    'STACILO',
];
const parties = [...seed.parties].sort(
    (a, b) => partyOrder.indexOf(a.code) - partyOrder.indexOf(b.code),
);
const axesByCode = new Map(
    seed.axes.map((axis, index) => [axis.code, { ...axis, order: index + 1 }]),
);
const questionById = new Map(
    seed.questions.map((question) => [question.id, question]),
);
const ratingsByQuestionParty = new Map(
    seed.ratings.map((rating) => [
        `${rating.questionId}:${rating.partyCode}`,
        rating,
    ]),
);

const answerLabels = {
    1: 'Nesouhlasí',
    2: 'Spíše nesouhlasí',
    3: 'Spíše souhlasí',
    4: 'Souhlasí',
};

const questionRows = [
    [
        'Pořadí',
        'Osa',
        'Pořadí v ose',
        'Kód otázky',
        'Facet',
        'Aktuální znění',
        'Popis / kontext',
        'Původní znění',
        'Otočená polarita',
        'Stav revize',
        'Poznámka k revizi',
    ],
    ...seed.questions.map((question) => [
        question.order,
        axesByCode.get(question.axisCode)?.name ?? question.axisCode,
        question.dimensionOrder,
        question.id,
        question.facet,
        question.text,
        question.description ?? '',
        question.originalText,
        question.reversed ? 'ano' : 'ne',
        question.reviewStatus,
        question.reviewNote ?? '',
    ]),
];

const matrixHeaders = [
    'Pořadí',
    'Osa',
    'Otázka',
    'Popis / kontext',
    ...parties.flatMap((party) => [
        `${party.code} odpověď`,
        `${party.code} hodnota`,
        `${party.code} status`,
        `${party.code} zdroj`,
    ]),
];
const matrixRows = [
    matrixHeaders,
    ...seed.questions.map((question) => [
        question.order,
        axesByCode.get(question.axisCode)?.name ?? question.axisCode,
        question.text,
        question.description ?? '',
        ...parties.flatMap((party) => {
            const rating = ratingsByQuestionParty.get(
                `${question.id}:${party.code}`,
            );
            return [
                rating?.rating ? answerLabels[rating.rating] : '',
                rating?.rating ?? '',
                rating?.evidenceStatus ?? '',
                rating?.evidenceTitle ?? rating?.evidenceUrl ?? '',
            ];
        }),
    ]),
];

const sourceRows = [
    [
        'Pořadí',
        'Osa',
        'Kód otázky',
        'Otázka',
        'Strana',
        'Kód strany',
        'Hodnota',
        'Odpověď',
        'Status',
        'Název zdroje',
        'URL',
        'Poznámka',
    ],
    ...seed.ratings
        .map((rating) => {
            const question = questionById.get(rating.questionId);
            const party = parties.find(
                (item) => item.code === rating.partyCode,
            );
            return [
                question?.order ?? '',
                axesByCode.get(question?.axisCode)?.name ??
                    question?.axisCode ??
                    '',
                rating.questionId,
                question?.text ?? '',
                party?.name ?? rating.partyCode,
                rating.partyCode,
                rating.rating ?? '',
                rating.rating ? answerLabels[rating.rating] : '',
                rating.evidenceStatus ?? '',
                rating.evidenceTitle ?? '',
                rating.evidenceUrl ?? '',
                rating.evidenceNote ?? '',
            ];
        })
        .sort(
            (a, b) =>
                Number(a[0]) - Number(b[0]) ||
                partyOrder.indexOf(String(a[5])) -
                    partyOrder.indexOf(String(b[5])),
        ),
];

const partyRows = [
    ['Kód', 'Název', 'Zdrojový sloupec'],
    ...parties.map((party) => [party.code, party.name, party.sourceColumn]),
];

const sheets = [
    {
        name: 'Otazky',
        rows: questionRows,
        widths: [10, 24, 12, 36, 28, 72, 72, 72, 16, 20, 48],
    },
    {
        name: 'Matice',
        rows: matrixRows,
        widths: [10, 24, 72, 72, ...parties.flatMap(() => [22, 12, 20, 44])],
    },
    {
        name: 'Zdroje',
        rows: sourceRows,
        widths: [10, 24, 36, 72, 28, 12, 10, 20, 22, 48, 48, 72],
    },
    { name: 'Strany', rows: partyRows, widths: [16, 36, 24] },
];

const crcTable = Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
        value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    return value >>> 0;
});

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, buildXlsx(sheets));
console.log(outputPath);

function buildXlsx(workbookSheets) {
    const files = new Map();
    files.set('[Content_Types].xml', contentTypes(workbookSheets.length));
    files.set('_rels/.rels', rootRels());
    files.set('xl/workbook.xml', workbookXml(workbookSheets));
    files.set(
        'xl/_rels/workbook.xml.rels',
        workbookRels(workbookSheets.length),
    );
    files.set('xl/styles.xml', stylesXml());
    workbookSheets.forEach((sheet, index) => {
        files.set(`xl/worksheets/sheet${index + 1}.xml`, worksheetXml(sheet));
    });
    return zipStore(files);
}

function worksheetXml(sheet) {
    const cols = sheet.widths
        .map(
            (width, index) =>
                `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`,
        )
        .join('');
    const rows = sheet.rows
        .map((row, rowIndex) => {
            const cells = row
                .map((value, columnIndex) =>
                    cellXml(
                        value,
                        rowIndex + 1,
                        columnIndex + 1,
                        rowIndex === 0,
                    ),
                )
                .join('');
            const attrs = rowIndex === 0 ? ' ht="22" customHeight="1"' : '';
            return `<row r="${rowIndex + 1}"${attrs}>${cells}</row>`;
        })
        .join('');

    return xml(
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
            <cols>${cols}</cols>
            <sheetData>${rows}</sheetData>
            <autoFilter ref="A1:${columnName(sheet.rows[0].length)}${sheet.rows.length}"/>
        </worksheet>`,
    );
}

function cellXml(value, row, column, isHeader) {
    const ref = `${columnName(column)}${row}`;
    const style = isHeader ? 1 : 2;
    if (typeof value === 'number') {
        return `<c r="${ref}" s="${style}"><v>${value}</v></c>`;
    }
    const text = String(value ?? '').slice(0, 32767);
    return `<c r="${ref}" s="${style}" t="inlineStr"><is><t>${escapeXml(text)}</t></is></c>`;
}

function workbookXml(workbookSheets) {
    return xml(
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
            <sheets>
                ${workbookSheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join('')}
            </sheets>
        </workbook>`,
    );
}

function workbookRels(sheetCount) {
    const sheetRels = Array.from(
        { length: sheetCount },
        (_, index) =>
            `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    ).join('');
    return xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            ${sheetRels}
            <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
        </Relationships>`,
    );
}

function contentTypes(sheetCount) {
    const sheetTypes = Array.from(
        { length: sheetCount },
        (_, index) =>
            `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    ).join('');
    return xml(
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
            <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
            <Default Extension="xml" ContentType="application/xml"/>
            <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
            <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
            ${sheetTypes}
        </Types>`,
    );
}

function rootRels() {
    return xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
            <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
        </Relationships>`,
    );
}

function stylesXml() {
    return xml(
        `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
            <fonts count="2">
                <font><sz val="11"/><name val="Calibri"/></font>
                <font><b/><sz val="11"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font>
            </fonts>
            <fills count="3">
                <fill><patternFill patternType="none"/></fill>
                <fill><patternFill patternType="gray125"/></fill>
                <fill><patternFill patternType="solid"><fgColor rgb="FF111827"/><bgColor indexed="64"/></patternFill></fill>
            </fills>
            <borders count="2">
                <border><left/><right/><top/><bottom/><diagonal/></border>
                <border><left style="thin"><color rgb="FFE5E7EB"/></left><right style="thin"><color rgb="FFE5E7EB"/></right><top style="thin"><color rgb="FFE5E7EB"/></top><bottom style="thin"><color rgb="FFE5E7EB"/></bottom><diagonal/></border>
            </borders>
            <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
            <cellXfs count="3">
                <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
                <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
                <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
            </cellXfs>
            <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
        </styleSheet>`,
    );
}

function xml(body) {
    return Buffer.from(
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${body.replace(/\s{2,}/g, ' ')}`,
        'utf8',
    );
}

function columnName(index) {
    let name = '';
    let value = index;
    while (value > 0) {
        const remainder = (value - 1) % 26;
        name = String.fromCharCode(65 + remainder) + name;
        value = Math.floor((value - 1) / 26);
    }
    return name;
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function zipStore(files) {
    const localParts = [];
    const centralParts = [];
    const dosTime = 0;
    const dosDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
    let offset = 0;

    for (const [name, data] of files) {
        const nameBuffer = Buffer.from(name, 'utf8');
        const payload = Buffer.isBuffer(data) ? data : Buffer.from(data);
        const crc = crc32(payload);
        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0);
        localHeader.writeUInt16LE(20, 4);
        localHeader.writeUInt16LE(0, 6);
        localHeader.writeUInt16LE(0, 8);
        localHeader.writeUInt16LE(dosTime, 10);
        localHeader.writeUInt16LE(dosDate, 12);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(payload.length, 18);
        localHeader.writeUInt32LE(payload.length, 22);
        localHeader.writeUInt16LE(nameBuffer.length, 26);
        localHeader.writeUInt16LE(0, 28);
        localParts.push(localHeader, nameBuffer, payload);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0);
        centralHeader.writeUInt16LE(20, 4);
        centralHeader.writeUInt16LE(20, 6);
        centralHeader.writeUInt16LE(0, 8);
        centralHeader.writeUInt16LE(0, 10);
        centralHeader.writeUInt16LE(dosTime, 12);
        centralHeader.writeUInt16LE(dosDate, 14);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(payload.length, 20);
        centralHeader.writeUInt32LE(payload.length, 24);
        centralHeader.writeUInt16LE(nameBuffer.length, 28);
        centralHeader.writeUInt16LE(0, 30);
        centralHeader.writeUInt16LE(0, 32);
        centralHeader.writeUInt16LE(0, 34);
        centralHeader.writeUInt16LE(0, 36);
        centralHeader.writeUInt32LE(0, 38);
        centralHeader.writeUInt32LE(offset, 42);
        centralParts.push(centralHeader, nameBuffer);

        offset += localHeader.length + nameBuffer.length + payload.length;
    }

    const centralDirectory = Buffer.concat(centralParts);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(0, 4);
    end.writeUInt16LE(0, 6);
    end.writeUInt16LE(files.size, 8);
    end.writeUInt16LE(files.size, 10);
    end.writeUInt32LE(centralDirectory.length, 12);
    end.writeUInt32LE(offset, 16);
    end.writeUInt16LE(0, 20);

    return Buffer.concat([...localParts, centralDirectory, end]);
}

function crc32(buffer) {
    let crc = 0xffffffff;
    for (const byte of buffer) {
        crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}
