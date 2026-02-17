# Unicara Life Planning Tool

ファイナンシャルプランナー向けのライフプランニングツールです。

## 機能一覧

- 基本情報入力（年齢・配偶者・子供）
- 月間収支計算（昇給率・配偶者収入の期間設定）
- 老後資金シミュレーション
  - 最低限の生活費 / ゆとりある生活費
  - インフレ率考慮
  - 不動産収入（複数物件対応）
- 教育資金シミュレーション
  - インフレ率反映
  - 大学費用の理系・文系区分
  - 複数の子供対応
- 資産運用シミュレーション
  - アクティブ投資 / インデックス投資の比較
  - 運用利回り別の月額積立額比較
- 詳細キャッシュフロー表（95歳まで）
  - 月間収支・教育費・投資額を年齢別に表示
- 必要な積立額まとめ（2パターン）

## 使い方

### CDNで動かす場合（最も簡単）

```
index.html をブラウザで開くだけ
```

### Reactプロジェクトに組み込む場合

```bash
npm install recharts
```

`life-planning-app.jsx` を `src/` に配置し、`App.jsx` から import:

```jsx
import LifePlanningApp from './life-planning-app';
export default function App() {
  return <LifePlanningApp />;
}
```

## ファイル構成

```
├── index.html              # ブラウザで直接開けるHTML
├── life-planning-app.jsx   # メインコンポーネント
└── README.md               # このファイル
```

## 技術スタック

- React 18
- Recharts（グラフ）
- Tailwind CSS（スタイリング）
