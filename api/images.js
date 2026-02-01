export default async function handler(req, res) {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const DATABASE_ID = process.env.DATABASE_ID;
  
  // URLパラメータからカテゴリを取得
  const category = req.query.category;

  try {
    // フィルタの設定（カテゴリ指定がある場合のみ）
    const requestBody = category ? {
      filter: {
        property: "カテゴリ",
        multi_select: {
          contains: category
        }
      }
    } : {};

    const response = await fetch(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    const data = await response.json();
    
    // 画像URLを抽出
    const images = data.results
      .map(page => {
        const fileProperty = Object.values(page.properties).find(
          prop => prop.type === 'files'
        );
        if (fileProperty && fileProperty.files.length > 0) {
          return fileProperty.files[0].file?.url || fileProperty.files[0].external?.url;
        }
        return null;
      })
      .filter(url => url !== null);

    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
