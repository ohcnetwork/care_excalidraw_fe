import { TooltipComponent } from "@/components/TooltipComponent";
import { format, formatDistanceToNow, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

type RelativeDateTooltipProps = {
  date: Date | string;
  className?: string;
};

export default function RelativeDateTooltip({
  date,
  className,
}: RelativeDateTooltipProps) {
  const { t } = useTranslation();
  if (!date) return null;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (!isValid(dateObj)) {
    return (
      <TooltipComponent content={t("invalid_date")}>
        <span className={className}>{t("invalid_date")}</span>
      </TooltipComponent>
    );
  }

  const hasTime = !!(
    dateObj.getHours() ||
    dateObj.getMinutes() ||
    dateObj.getSeconds()
  );

  return (
    <TooltipComponent
      content={hasTime ? format(dateObj, "PPp zzz") : format(dateObj, "PP")}
    >
      <time dateTime={dateObj.toISOString()} className={className}>
        {formatDistanceToNow(dateObj)}
      </time>
    </TooltipComponent>
  );
}
