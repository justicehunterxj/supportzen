'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useSettings, initialAvatar } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/contexts/ticket-context';
import { useShifts } from '@/contexts/shift-context';
import { Download, Upload, Sun, Moon, Monitor, Trash2 } from 'lucide-react';
import type { Ticket, Shift, TicketCategory } from '@/lib/types';
import type { TimeFormat } from '@/contexts/settings-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';


export default function SettingsPage() {
    const { 
        theme, setTheme, 
        timeFormat, setTimeFormat,
        avatarUrl, setAvatarUrl,
        ticketDisplayLimit, setTicketDisplayLimit
    } = useSettings();
    const { tickets, setTickets } = useTickets();
    const { shifts, setShifts } = useShifts();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [isClearAlertOpen, setIsClearAlertOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);
    const avatarFileInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleAvatarButtonClick = () => {
        avatarFileInputRef.current?.click();
    };

    const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarUrl(e.target?.result as string);
                toast({
                    title: 'Avatar Updated',
                    description: 'Your profile picture has been changed.',
                });
            };
            reader.readAsDataURL(file);
        } else if (file) {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please select an image file (e.g., PNG, JPG).',
            });
        }
        if(event.target) {
            event.target.value = "";
        }
    };
    
    const handleExport = () => {
        try {
            const dataToExport = {
                settings: {
                    theme,
                    timeFormat,
                    avatarUrl,
                    ticketDisplayLimit
                },
                tickets: tickets.map(t => ({...t, createdAt: t.createdAt.toISOString(), updatedAt: t.updatedAt.toISOString()})),
                shifts: shifts.map(s => ({
                    ...s,
                    startedAt: s.startedAt?.toISOString(),
                    endedAt: s.endedAt?.toISOString(),
                })),
            };
            const dataStr = JSON.stringify(dataToExport, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `supportzen-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast({
                title: "Export Successful",
                description: "Your data and settings have been exported.",
            });
        } catch (error) {
            console.error("Export failed", error);
            toast({
                variant: 'destructive',
                title: "Export Failed",
                description: "Could not export your data. Please try again.",
            });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read");
                }
                const importedData = JSON.parse(text);
                const ticketCategories: TicketCategory[] = ['Account Issue', 'Billing & Payments', 'Technical Issue', 'Feedback', 'General Query', 'Others'];

                // Validate and set data
                if (importedData.settings) {
                    if (importedData.settings.theme) setTheme(importedData.settings.theme);
                    if (importedData.settings.timeFormat) setTimeFormat(importedData.settings.timeFormat as TimeFormat);
                    if (importedData.settings.avatarUrl) setAvatarUrl(importedData.settings.avatarUrl);
                    if (importedData.settings.ticketDisplayLimit !== undefined && importedData.settings.ticketDisplayLimit !== null) {
                        setTicketDisplayLimit(importedData.settings.ticketDisplayLimit);
                    }
                }
                if (Array.isArray(importedData.tickets)) {
                    const parsedTickets: Ticket[] = importedData.tickets.map((t: any) => {
                        const agentResponse = t.agentResponse || t.response;
                        
                        let mappedCategory: TicketCategory[];
                        if (typeof t.category === 'string') {
                            if (t.category === 'Support') {
                                mappedCategory = ['General Query'];
                            } else if ((ticketCategories as string[]).includes(t.category)) {
                                mappedCategory = [t.category as TicketCategory];
                            } else {
                                mappedCategory = ['Others'];
                            }
                        } else if (Array.isArray(t.category)) {
                            mappedCategory = t.category.filter((c: any) => (ticketCategories as string[]).includes(c));
                            if (mappedCategory.length === 0) {
                                mappedCategory = ['Others'];
                            }
                        } else {
                            mappedCategory = ['Others'];
                        }

                        // Remove original response and category to avoid conflicts if they exist
                        const { response, category, ...restOfTicket } = t;

                        return {
                            ...restOfTicket,
                            agentResponse,
                            category: mappedCategory,
                            createdAt: new Date(t.createdAt),
                            updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(t.createdAt),
                            isArchived: t.isArchived || false,
                        };
                    });
                    setTickets(parsedTickets);
                }
                if (Array.isArray(importedData.shifts)) {
                    const parsedShifts: Shift[] = importedData.shifts.map((s: any) => ({
                        ...s,
                        startedAt: s.startedAt ? new Date(s.startedAt) : undefined,
                        endedAt: s.endedAt ? new Date(s.endedAt) : undefined,
                    }));
                    setShifts(parsedShifts);
                }

                toast({
                    title: "Import Successful",
                    description: "Your data and settings have been restored.",
                });

            } catch (error) {
                console.error("Import failed", error);
                toast({
                    variant: 'destructive',
                    title: "Import Failed",
                    description: "The selected file is not valid. Please check the file and try again.",
                });
            } finally {
                // Reset file input
                if(fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    const handleClearDataConfirm = () => {
        try {
            // Clear all tickets and shifts from state
            setTickets([]);
            setShifts([]);

            // Reset settings to default
            setAvatarUrl(initialAvatar);
            setTheme('system');
            setTimeFormat('12h');
            setTicketDisplayLimit(10);

            // Explicitly set localStorage to empty arrays to persist the cleared state
            localStorage.setItem('tickets', '[]');
            localStorage.setItem('shifts', '[]');
            localStorage.removeItem('avatarUrl');
            localStorage.removeItem('timeFormat');
            localStorage.removeItem('ticketDisplayLimit');
            // 'theme' is handled by next-themes library, no need to remove manually

            toast({
                title: "Data Cleared",
                description: "All your data has been wiped. The dashboard is now in a fresh state.",
            });
        } catch (error) {
            console.error("Failed to clear data", error);
            toast({
                variant: 'destructive',
                title: "Clear Data Failed",
                description: "Could not clear your data. Please try again.",
            });
        } finally {
            setIsClearAlertOpen(false);
        }
    };

    if (!mounted) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>Manage your profile picture.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center gap-6">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <Skeleton className="h-10 w-32" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Theme</Label>
                            <div className="flex space-x-2">
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-10 w-10" />
                                <Skeleton className="h-10 w-10" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Time Format</Label>
                            <div className="flex space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Data Management</CardTitle>
                        <CardDescription>Import, export, or clear your dashboard data and settings.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                         <Skeleton className="h-10 w-32" />
                         <Skeleton className="h-10 w-32" />
                         <Skeleton className="h-10 w-32" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Manage your profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border">
                        <AvatarImage src={avatarUrl} alt="Admin" />
                        <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <Button onClick={handleAvatarButtonClick}>Change Picture</Button>
                    <Input
                        type="file"
                        ref={avatarFileInputRef}
                        onChange={handleAvatarFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={setTheme}
                            className="flex space-x-2"
                        >
                            <div className="flex items-center space-x-2">
                                <Button variant={theme === 'light' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('light')}><Sun/></Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant={theme === 'dark' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('dark')}><Moon/></Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant={theme === 'system' ? 'default' : 'outline'} size="icon" onClick={() => setTheme('system')}><Monitor/></Button>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Time Format</Label>
                        <RadioGroup
                            value={timeFormat}
                            onValueChange={(value) => setTimeFormat(value as TimeFormat)}
                            className="flex space-x-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="12h" id="12h" />
                                <Label htmlFor="12h">12-hour</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="24h" id="24h" />
                                <Label htmlFor="24h">24-hour</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Tickets Per Page</Label>
                        <RadioGroup
                            value={ticketDisplayLimit.toString()}
                            onValueChange={(value) => setTicketDisplayLimit(parseInt(value, 10))}
                            className="flex flex-wrap items-center gap-x-4 gap-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="10" id="limit-10" />
                                <Label htmlFor="limit-10">10</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="20" id="limit-20" />
                                <Label htmlFor="limit-20">20</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="50" id="limit-50" />
                                <Label htmlFor="limit-50">50</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="-1" id="limit-all" />
                                <Label htmlFor="limit-all">All</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Import, export, or clear your dashboard data and settings.</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                     <Button onClick={handleExport} variant="outline" className="gap-2">
                        <Download className="h-4 w-4"/>
                        Export Data
                    </Button>
                    <Button onClick={handleImportClick} variant="outline" className="gap-2">
                        <Upload className="h-4 w-4"/>
                        Import Data
                    </Button>
                     <Button onClick={() => setIsClearAlertOpen(true)} variant="destructive" className="gap-2">
                        <Trash2 className="h-4 w-4"/>
                        Clear Data
                    </Button>
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/json"
                    />
                </CardContent>
            </Card>

            <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your tickets and shifts, and reset your settings.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className={buttonVariants({ variant: "destructive" })}
                        onClick={handleClearDataConfirm}
                    >
                        Wipe Data
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
