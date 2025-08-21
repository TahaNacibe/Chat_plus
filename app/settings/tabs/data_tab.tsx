import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, RefreshCw, FileText, Upload, Download, Database, Table, Shield, Trash2 } from "lucide-react";
import WideAction from "../components/action_tile";
import { FormField } from "../components/costume_form_field";
import Section from "../components/costume_section";
import Link from "next/link";


interface DataTabInterface {
    // Memory section
    showMemoryPasswordInput: boolean;
    setShowMemoryPasswordInput: (state: boolean) => void;
    memoryBackupPassword: string;
    setMemoryBackupPassword: (value: string) => void;

    // RAG section
    showRagPasswordInput: boolean;
    setShowRagPasswordInput: (value: boolean) => void;
    ragBackupPassword: string;
    setRagBackupPassword: (value: string) => void;

    // General data management
    showPasswordInput: boolean;
    setShowPasswordInput: (state: boolean) => void;
    backupPassword: string;
    setBackupPassword: (value: string) => void;

    // Actions
    handleBackup: (type: 'memory' | 'rag' | 'general') => void;
    handleLoadBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDeleteAllData: () => void;
}



export default function DataTab({
showMemoryPasswordInput,
setShowMemoryPasswordInput,
memoryBackupPassword,
setMemoryBackupPassword,
showRagPasswordInput,
setShowRagPasswordInput,
ragBackupPassword,
setRagBackupPassword,
showPasswordInput,
setShowPasswordInput,
backupPassword,
setBackupPassword,
handleBackup,
handleLoadBackup,
handleDeleteAllData
}:DataTabInterface) {
    return (
    <div className="space-y-6">
        {/* Memory Section */}
        <Section title="Memory Management" icon={Brain}>
        <div className="flex flex-col space-y-2">
            <WideAction
            onClick={() => alert('Memory reset!')}
            icon={RefreshCw}
            label="Reset Memory"
            description="Clear all stored memory entries."
            />

            <Link href={"/memories_list"}>
            <WideAction
            onClick={() => {}}
            icon={FileText}
            label="Edit Entries"
            description="Modify the memory entries manually."
            />
            </Link>

            <WideAction
            onClick={() => setShowMemoryPasswordInput(true)}
            icon={Upload}
            label="Backup Memory"
            description="Create an encrypted backup of memory data."
            />

            <div className="relative">
            <Input
                type="file"
                accept=".json"
                onChange={(e) => alert('Loading memory backup...')}
                className="absolute inset-0 opacity-0 cursor-pointer focus-visible:ring-0"
            />
            <WideAction
                onClick={() => {}}
                icon={Download}
                label="Load Backup"
                description="Restore memory from a backup file."
            />
            </div>
        </div>

        {showMemoryPasswordInput && (
            <div className="border border-gray-900 rounded-lg p-6 bg-gray-50 dark:border-gray-800 dark:bg-black">
            <FormField
                label="Memory Backup Password"
                htmlFor="memory-backup-password"
                description="This password will be used for encryption"
            >
                <Input
                id="memory-backup-password"
                type="password"
                value={memoryBackupPassword}
                onChange={(e) => setMemoryBackupPassword(e.target.value)}
                placeholder="Enter a password for memory backup"
                className="border-2 border-gray-900 focus:border-gray-700 focus-visible:ring-0"
                />
            </FormField>
            <div className="flex space-x-2 mt-4">
                <Button onClick={() => handleBackup('memory')} className="bg-gray-900 text-white border hover:bg-gray-900">Create Backup</Button>
                <Button
                variant="outline"
                onClick={() => {
                    setShowMemoryPasswordInput(false);
                    setMemoryBackupPassword('');
                }}
                className="border-gray-900 dark:border-gray-600 dark:text-gray-200 text-gray-900 hover:bg-gray-900 hover:text-white"
                >
                Cancel
                </Button>
            </div>
            </div>
        )}
        </Section>

        {/* RAG Section */}
        <Section title="RAG (Retrieval-Augmented Generation)" icon={Database}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <WideAction
            onClick={() => alert('RAG table reset!')}
            icon={RefreshCw}
            label="Reset RAG Table"
            description="Clear all stored RAG entries."
            />

            <Link href={"/rag_list"}>
            <WideAction
            onClick={() =>{}}
            icon={Table}
            label="Edit Entries"
            description="Manually edit RAG table entries."
            />
            </Link>

            <WideAction
            onClick={() => setShowRagPasswordInput(true)}
            icon={Upload}
            label="Backup RAG"
            description="Create an encrypted backup of RAG data."
            />

            <div className="relative">
            <Input
                type="file"
                accept=".json"
                onChange={(e) => alert('Loading RAG backup...')}
                className="absolute inset-0 opacity-0 cursor-pointer focus-visible:ring-0"
            />
            <WideAction
                onClick={() => {}}
                icon={Download}
                label="Load Backup"
                description="Restore RAG data from a backup."
            />
            </div>
        </div>

        {showRagPasswordInput && (
            <div className="border-2 border-gray-900 rounded-lg p-6 bg-gray-50">
            <FormField
                label="RAG Backup Password"
                htmlFor="rag-backup-password"
                description="This password will be used for encryption"
            >
                <Input
                id="rag-backup-password"
                type="password"
                value={ragBackupPassword}
                onChange={(e) => setRagBackupPassword(e.target.value)}
                placeholder="Enter a password for RAG backup"
                className="border-2 border-gray-900 focus:border-gray-700 focus-visible:ring-0"
                />
            </FormField>
            <div className="flex space-x-2 mt-4">
                <Button onClick={() => handleBackup('rag')} className="bg-gray-900 text-white hover:bg-gray-800">Create Backup</Button>
                <Button
                variant="outline"
                onClick={() => {
                    setShowRagPasswordInput(false);
                    setRagBackupPassword('');
                }}
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                >
                Cancel
                </Button>
            </div>
            </div>
        )}
        </Section>

        {/* General Data Management Section */}
        <Section title="General Data Management" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <WideAction
            onClick={() => setShowPasswordInput(true)}
            icon={Upload}
            label="Backup All Data"
            description="Encrypt and backup all data sets."
            />

            <div className="relative">
            <Input
                type="file"
                accept=".json"
                onChange={handleLoadBackup}
                className="absolute inset-0 opacity-0 cursor-pointer focus-visible:ring-0"
            />
            <WideAction
                onClick={() => {}}
                icon={Download}
                label="Load All Data"
                description="Restore all datasets from backup."
            />
            </div>

            <WideAction
            onClick={handleDeleteAllData}
            icon={Trash2}
            label="Delete All Data"
            description="Permanently remove all data from storage."
            variant="destructive"
            />
        </div>

        {showPasswordInput && (
            <div className="border-2 border-gray-900 rounded-lg p-6 bg-gray-50">
            <FormField
                label="General Backup Password"
                htmlFor="general-backup-password"
                description="This password will be used for encryption"
            >
                <Input
                id="general-backup-password"
                type="password"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                placeholder="Enter a password for general backup"
                className="border-2 border-gray-900 focus:border-gray-700 focus-visible:ring-0"
                />
            </FormField>
            <div className="flex space-x-2 mt-4">
                <Button onClick={() => handleBackup('general')} className="bg-gray-900 text-white hover:bg-gray-800">Create Backup</Button>
                <Button
                variant="outline"
                onClick={() => {
                    setShowPasswordInput(false);
                    setBackupPassword('');
                }}
                className="border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
                >
                Cancel
                </Button>
            </div>
            </div>
        )}
        </Section>
    </div>
);
}