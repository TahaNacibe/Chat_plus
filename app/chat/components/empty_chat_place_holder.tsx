export default function EmptyMessagesScreen({userName}:{userName:string | null}) {
    return (
        <div className="flex flex-col justify-center items-center w-full h-full prevent-select">
                <h1 className="text-4xl">
                Welcome back {userName ?? ""}!
            </h1>
            <h1 className="pt-2 text-lg text-gray-500">
                What will we talk about today? anything specific in your in mind?
            </h1>

        </div>
    )
}