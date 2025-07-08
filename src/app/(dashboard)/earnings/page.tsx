import { EarningsPage } from "@/components/pages/earnings-page";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Earnings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Earnings Calculator</CardTitle>
                <CardDescription>
                    Calculate total earnings from resolved tickets and convert to local currency.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <EarningsPage />
            </CardContent>
        </Card>
    );
}
