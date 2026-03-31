/**
 * approvalFlow.js
 * ---------------
 * Business logic utility for the Announcement Governance Engine.
 * Determines approval status and routing based on the author's role and target scope.
 */

/**
 * @param {string} authorRole - The role of the announcement author ('lecturer','hod','dean','principal','admin')
 * @param {string} targetScope - The announcement's target scope ('module','department','school','college')
 * @returns {{ status: string, pendingApprovalFromRole: string|null }}
 */
export const determineApprovalFlow = (authorRole, targetScope) => {
    switch (authorRole) {
        case 'lecturer':
            if (targetScope === 'module') {
                return { status: 'published', pendingApprovalFromRole: null };
            }
            if (targetScope === 'department') {
                return { status: 'pending', pendingApprovalFromRole: 'hod' };
            }
            // school or college is DENIED
            throw new Error(
                'Lecturers cannot publish to School or College scope. Please escalate through your Head of Department.'
            );

        case 'hod':
            if (targetScope === 'module' || targetScope === 'department') {
                return { status: 'published', pendingApprovalFromRole: null };
            }
            if (targetScope === 'school') {
                return { status: 'pending', pendingApprovalFromRole: 'dean' };
            }
            // college is DENIED
            throw new Error(
                'Heads of Department cannot publish to College scope directly. Please escalate through your Dean.'
            );

        case 'dean':
            if (['module', 'department', 'school'].includes(targetScope)) {
                return { status: 'published', pendingApprovalFromRole: null };
            }
            if (targetScope === 'college') {
                return { status: 'pending', pendingApprovalFromRole: 'principal' };
            }
            break;

        case 'principal':
        case 'admin':
            // Full publish access everywhere
            return { status: 'published', pendingApprovalFromRole: null };

        default:
            throw new Error(`Unknown author role: ${authorRole}. Cannot determine approval flow.`);
    }
};
