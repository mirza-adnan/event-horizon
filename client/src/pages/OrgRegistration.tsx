import OrgRegistrationForm from "../components/OrgRegistration/OrgRegistrationForm";

function OrgRegistration() {
  return (
    <div>
      <div className="w-11/12 max-w-[640px] mx-auto mt-24 p-8 bg-[#20201d] rounded-xl">
        <div className="space-y-2">
          <h2 className="text-4xl text-text-strong">Organizer Registration</h2>
          <p className="text-base text-text-weak">
            Your first step towards managing amazing events
          </p>
        </div>
        <div>
          <OrgRegistrationForm />
        </div>
      </div>
    </div>
  );
}

export default OrgRegistration;
