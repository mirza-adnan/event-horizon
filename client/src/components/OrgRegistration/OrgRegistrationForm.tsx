import { useState } from "react";
import Input from "../Input";
import Button from "../Button";

function OrgRegistrationForm() {
  const [currStep, setCurrStep] = useState(1);

  return (
    <div className="mt-6 space-y-12">
      <form className="flex flex-col gap-y-4">
        <Input
          name="org-name"
          type="text"
          required={true}
          placeholder={"Example Interactive"}
          label="Organizer's Name"
        />
        <Input
          name="org-email"
          type="email"
          required={true}
          placeholder={"org@email.com"}
          label="Organizer's Email"
        />
        <Input
          name="org-phone"
          type="tel"
          required={true}
          placeholder={"01234567890"}
          label="Contact Number"
        />
      </form>
      <div className="w-full flex justify-between">
        <Button variant="secondary">Previous</Button>
        <Button variant="primary">Next</Button>
      </div>
    </div>
  );
}

export default OrgRegistrationForm;
