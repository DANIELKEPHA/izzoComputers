"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Mail, Users, Bell, Shield, UserCog } from "lucide-react";

import AdminSettings from "./components/adminSettings";
import NewsletterSubscribersPage from "./components/NewsletterSubscribersPage";

// Define additional component placeholders for other settings tabs
const UserManagementPage = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">User Management</h3>
        <p className="text-gray-500">Manage application users and their permissions.</p>
        {/* Add your user management component here */}
    </div>
);

const NotificationSettings = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Notification Settings</h3>
        <p className="text-gray-500">Configure how and when notifications are sent.</p>
        {/* Add your notification settings component here */}
    </div>
);

const SecuritySettings = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Security Settings</h3>
        <p className="text-gray-500">Configure security preferences and access controls.</p>
        {/* Add your security settings component here */}
    </div>
);

const ProfileSettings = () => (
    <div className="space-y-4">
        <h3 className="text-lg font-medium">Profile Settings</h3>
        <p className="text-gray-500">Update your personal profile information.</p>
        {/* Add your profile settings component here */}
    </div>
);

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-500 mt-2">
                    Manage your application settings and preferences
                </p>
            </div>

            <Tabs
                defaultValue="profile"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-6"
            >
                <div className="border-b">
                    <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                        <TabsTrigger
                            value="profile"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                        >
                            <UserCog className="w-4 h-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger
                            value="admin"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Admin Settings
                        </TabsTrigger>
                        <TabsTrigger
                            value="newsletter"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Newsletter
                        </TabsTrigger>
                        <TabsTrigger
                            value="users"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            User Management
                        </TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger
                            value="security"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-4"
                        >
                            <Shield className="w-4 h-4 mr-2" />
                            Security
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>
                                Update your personal profile information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileSettings />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Settings</CardTitle>
                            <CardDescription>
                                Manage administrator preferences and system configuration
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AdminSettings />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="newsletter" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Newsletter Subscribers</CardTitle>
                            <CardDescription>
                                Manage and view all subscribers to your newsletter
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NewsletterSubscribersPage />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>
                                Manage application users and their permissions
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <UserManagementPage />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>
                                Configure how and when notifications are sent
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationSettings />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Configure security preferences and access controls
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <SecuritySettings />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;