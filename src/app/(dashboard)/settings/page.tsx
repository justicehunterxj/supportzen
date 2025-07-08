'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/hooks/use-toast';
import { useTickets } from '@/contexts/ticket-context';
import { useShifts } from '@/contexts/shift-context';
import { Download, Upload, Sun, Moon, Monitor } from 'lucide-react';
import type { Ticket, Shift, TicketCategory } from '@/lib/types';
import type { TimeFormat } from '@/contexts/settings-context';


export default function SettingsPage() {
    const { 
        theme, setTheme, 
        timeFormat, setTimeFormat,
        avatarUrl, setAvatarUrl
    } = useSettings();
    const { tickets, setTickets } = useTickets();
    const { shifts, setShifts } = useShifts();
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarChange = () => {
        // Simple avatar change by cycling through a few pravatar images
        const newId = Math.random().toString(36).substring(7);
        const newUrl = `https://i.pravatar.cc/150?u=${newId}`;
        setAvatarUrl(newUrl);
        toast({
            title: "Avatar Updated",
            description: "Your profile picture has been changed.",
        });
    };
    
    const handleExport = () => {
        try {
            const dataToExport = {
                settings: {
                    theme,
                    timeFormat,
                    avatarUrl
                },
                tickets: tickets.map(t => ({...t, createdAt: t.createdAt.toISOString()})),
                shifts,
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
                        };
                    });
                    setTickets(parsedTickets);
                }
                if (Array.isArray(importedData.shifts)) {
                    setShifts(importedData.shifts as Shift[]);
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
                    <Button onClick={handleAvatarChange}>Change Picture</Button>
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
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Import or export your dashboard data and settings.</CardDescription>
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
                    <Input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/json"
                    />
                </CardContent>
            </Card>
        </div>
    );
}
