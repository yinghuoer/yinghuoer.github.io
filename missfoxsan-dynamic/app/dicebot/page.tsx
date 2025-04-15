'use client';

export default function DicebotPage() {
  return (
    <div className="container">
      <div className="hero">
        <div className="hero-content">
          <h1 className="page-title">骰点功能</h1>
          <p className="page-description">
            狐狸小姐支持多种TRPG规则系统的骰点功能，包括COC、DND等。
          </p>
        </div>
      </div>

      <main>
        <h2>基础骰点</h2>
        <p>最基本的骰点指令，用于投掷指定数量和面数的骰子。</p>
        <p>示例：.r 1d20 - 投掷1个20面骰</p>
        
        <h2>COC规则</h2>
        <p>进行克苏鲁的呼唤(COC)规则下的技能检定。</p>
        <p>示例：.ra 60 - 对60的技能进行检定</p>
        
        <h2>DND规则</h2>
        <p>进行龙与地下城(D&D)规则下的检定。</p>
        <p>示例：.r 1d20+5 - 进行+5调整值的检定</p>
      </main>
    </div>
  );
}
