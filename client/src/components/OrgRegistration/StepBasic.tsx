import Input from "../Input";

export default function StepBasic({ form, onChange }: any) {
    return (
        <div className="space-y-5">
            <Input
                label="Organization Name"
                value={form.name}
                onChange={(e) => onChange("name", e.target.value)}
                required
            />

            <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => onChange("email", e.target.value)}
                required
            />

            <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(e) => onChange("phone", e.target.value)}
                placeholder=""
                required
            />

            <Input
                label="Password"
                type="password"
                value={form.password}
                onChange={(e) => onChange("password", e.target.value)}
                required
            />
        </div>
    );
}
