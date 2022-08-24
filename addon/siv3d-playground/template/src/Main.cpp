# include <Siv3D.hpp>

void Main()
{
	// 背景を水色にする
	Scene::SetBackground(ColorF{ 0.8, 0.9, 1.0 });

	// 通常のフォントを作成
	const Font font{ 60 };
	
	// 絵文字用フォントを作成
	const Font emojiFont{ 60, Typeface::ColorEmoji };
	
	// `font` が絵文字用フォントも使えるようにする
	font.addFallback(emojiFont);

	// 画像ファイルからテクスチャを作成
	const Texture texture{ U"example/windmill.png" };

	// 絵文字からテクスチャを作成
	const Texture emoji{ U"🐈"_emoji };

	// 絵文字を描画する座標
	Vec2 emojiPos{ 300, 150 };

	// テキストを画面にデバッグ出力
	Print << U"Push [A] key";

	Platform::Web::System::SetMainLoop([&]
	{
		System::Update();
		
		// テクスチャを描く
		texture.draw(200, 200);

		// テキストを画面の中心に描く
		font(U"Hello, Siv3D!🚀").drawAt(Scene::Center(), Palette::Black);

		// サイズをアニメーションさせて絵文字を描く
		emoji.resized(100 + Periodic::Sine0_1(1s) * 20).drawAt(emojiPos);

		// マウスカーソルに追随する半透明な円を描く
		Circle{ Cursor::Pos(), 40 }.draw(ColorF{ 1, 0, 0, 0.5 });

		// もし [A] キーが押されたら
		if (KeyA.down())
		{
			// 選択肢からランダムに選ばれたメッセージをデバッグ表示
			Print << Sample({ U"Hello!", U"こんにちは", U"你好", U"안녕하세요?" });
		}

		// もし [Button] が押されたら
		if (SimpleGUI::Button(U"Button", Vec2{ 640, 40 }))
		{
			// 画面内のランダムな場所に座標を移動
			emojiPos = RandomVec2(Scene::Rect());
		}
	});
}
