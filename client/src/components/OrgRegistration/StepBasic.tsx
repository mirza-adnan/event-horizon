import Input from "../Input";

export default function StepBasic({ form, onChange }: any) {
    return (
        <div className="space-y-5">
            <Input
                type="text"
                label="Organization Name"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required={true}
            />

            <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required={true}
            />

            <Input
                type="tel"
                label="Phone"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                required={true}
            />

            <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                required={true}
            />
        </div>
    );
}
