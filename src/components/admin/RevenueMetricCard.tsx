interface MetricItem {
  label: string;
  value: string;
}

interface RevenueMetricCardProps {
  title: string;
  metrics: MetricItem[];
}

export const RevenueMetricCard = ({ title, metrics }: RevenueMetricCardProps) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <div className="space-y-3">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">{metric.label}</span>
            <span className="text-sm font-semibold text-foreground">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
