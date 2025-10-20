import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TriangleAlertIcon } from "lucide-react";

const stats = [
  { title: "Revenue Today", value: "$12,480", hint: "+8.4% vs yesterday" },
  { title: "Orders Today", value: "146", hint: "18 pending fulfillment" },
  { title: "Active Customers", value: "2,304", hint: "127 online now" },
  { title: "Low Stock SKUs", value: "9", hint: "Need restock within 24h" },
];

const orderRows = [
  { code: "#ORD-1024", customer: "Nguyen Minh", total: "$42.00", status: "Ready" },
  { code: "#ORD-1023", customer: "Tran Anh", total: "$17.50", status: "Packing" },
  { code: "#ORD-1022", customer: "Le Hoang", total: "$29.90", status: "Pending" },
  { code: "#ORD-1021", customer: "Pham Thu", total: "$64.10", status: "Shipped" },
];

const channelProgress = [
  { label: "Website", value: 62 },
  { label: "Delivery Apps", value: 28 },
  { label: "In-store", value: 10 },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-balance">Dashboard Overview</h2>
        <p className="text-sm text-muted-foreground">
          Track sales, orders, and inventory signals for faster daily decisions.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.hint}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Latest Orders</CardTitle>
            <CardDescription>Realtime overview of recent order activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderRows.map((row) => (
                  <TableRow key={row.code}>
                    <TableCell className="font-medium">{row.code}</TableCell>
                    <TableCell>{row.customer}</TableCell>
                    <TableCell className="tabular-nums">{row.total}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Channels</CardTitle>
            <CardDescription>Distribution of orders by channel today.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {channelProgress.map((channel) => (
              <Progress key={channel.label} value={channel.value}>
                <ProgressLabel>{channel.label}</ProgressLabel>
                <ProgressValue>{(_, value) => `${value ?? 0}%`}</ProgressValue>
              </Progress>
            ))}
          </CardContent>
        </Card>
      </section>

      <Alert>
        <TriangleAlertIcon />
        <AlertTitle>Action Required</AlertTitle>
        <AlertDescription>
          3 products are almost out of stock. Replenish inventory to avoid order delays.
        </AlertDescription>
      </Alert>
    </div>
  );
}
