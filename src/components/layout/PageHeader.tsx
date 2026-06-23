import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: ReactNode;
  chip?: ReactNode;
  note?: ReactNode;
  actions?: ReactNode;
}

// 화면 상단 헤더 통일용. 좌측(아이콘·제목·chip·note) + 우측 actions(필터/검색) slot.
export function PageHeader({ icon: Icon, iconClassName, title, chip, note, actions }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-main">
        <div className="page-header-title">
          {Icon && <Icon size={14} className={iconClassName} />}
          <span>{title}</span>
          {chip}
        </div>
        {note && <p className="page-header-note">{note}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
