export function checkConstraints(
    users: any[],
    segmentId: string,
    constraints: any[],
    registrationCode?: string
): string | null {
    if (!constraints || constraints.length === 0) return null;

    // Filter constraints applicable to this segment
    const applicableConstraints = constraints.filter((c) => {
        return (
            c.includedSegments &&
            (c.includedSegments.includes("all") ||
                c.includedSegments.includes(segmentId))
        );
    });

    if (applicableConstraints.length === 0) return null;

    for (const constraint of applicableConstraints) {
        const { type, config } = constraint;

        if (type === "code") {
            const requiredCode = config.code;
            if (requiredCode && registrationCode !== requiredCode) {
                return "Invalid registration code.";
            }
        } else {
            // Check individual user constraints
            for (const user of users) {
                const userName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "A user";

                if (type === "age") {
                    if (!user.dateOfBirth) {
                         return `${userName} is missing date of birth, which is required for an age constraint.`;
                    }
                    
                    const dob = new Date(user.dateOfBirth);
                    const today = new Date();
                    let age = today.getFullYear() - dob.getFullYear();
                    const m = today.getMonth() - dob.getMonth();
                    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                        age--;
                    }

                    if (config.minAge !== undefined && config.minAge !== "" && age < parseInt(config.minAge)) {
                        return `${userName} does not meet the minimum age requirement of ${config.minAge}.`;
                    }
                    if (config.maxAge !== undefined && config.maxAge !== "" && age > parseInt(config.maxAge)) {
                        return `${userName} exceeds the maximum age limit of ${config.maxAge}.`;
                    }
                }

                if (type === "gender") {
                    const allowed = config.allowedGenders || [];
                    if (allowed.length > 0 && !allowed.includes(user.gender)) {
                        return `${userName}'s gender (${user.gender}) is not allowed for this segment. Allowed: ${allowed.join(", ")}.`;
                    }
                }

                if (type === "status") {
                    const allowed = config.allowedStatuses || [];
                    if (allowed.length > 0 && !allowed.includes(user.status)) {
                        return `${userName}'s status (${user.status || "None"}) is not allowed for this segment. Allowed: ${allowed.join(", ")}.`;
                    }
                }

                if (type === "domain") {
                    const allowedDomainsStr = config.allowedDomains || "";
                    if (allowedDomainsStr.trim() !== "") {
                        const allowedDomains = allowedDomainsStr.split(",").map((d: string) => d.trim().toLowerCase());
                        const userDomain = user.email.split("@")[1]?.toLowerCase();
                        
                        let isAllowed = false;
                        for(const domain of allowedDomains) {
                             if (userDomain === domain || userDomain.endsWith(`.${domain}`)) {
                                 isAllowed = true;
                                 break;
                             }
                        }

                        if (!isAllowed) {
                            return `${userName}'s email domain (${userDomain}) is not permitted. Allowed: ${allowedDomainsStr}.`;
                        }
                    }
                }
            }
        }
    }

    return null;
}
