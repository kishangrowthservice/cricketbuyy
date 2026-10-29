import crypto from 'crypto';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/codes';

export interface AdminInvitation {
  id: string;
  email: string;
  tokenHash: string;
  roleId: string;
  roleName: string;
  invitedBy: string;
  inviterEmail: string;
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

// In-memory / DB representation for invitation tokens (§5.8)
const invitationRegistry = new Map<string, AdminInvitation>();

export class InvitationManager {
  public static readonly DEFAULT_EXPIRY_HOURS = 72;

  /**
   * Generates a 256-bit secure invitation token and stores only its SHA-256 hash (§5.8).
   * Returns the plaintext token to be delivered in the invite link.
   */
  public static createInvitation(params: {
    email: string;
    roleId: string;
    roleName: string;
    invitedBy: string;
    inviterEmail: string;
    expiryHours?: number;
  }): { rawToken: string; invitation: AdminInvitation } {
    const rawToken = crypto.randomBytes(32).toString('hex'); // 256-bit entropy
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const id = `inv_${crypto.randomBytes(8).toString('hex')}`;
    const expiresAt = new Date(
      Date.now() + (params.expiryHours || this.DEFAULT_EXPIRY_HOURS) * 60 * 60 * 1000
    );

    const invitation: AdminInvitation = {
      id,
      email: params.email.toLowerCase(),
      tokenHash,
      roleId: params.roleId,
      roleName: params.roleName,
      invitedBy: params.invitedBy,
      inviterEmail: params.inviterEmail,
      expiresAt,
      usedAt: null,
      createdAt: new Date()
    };

    invitationRegistry.set(tokenHash, invitation);

    return { rawToken, invitation };
  }

  /**
   * Atomically consumes a single-use invitation token (§5.8).
   * Equivalent to: UPDATE admin.invitations SET used_at = now() WHERE used_at IS NULL AND expires_at > now() RETURNING *
   */
  public static consumeInvitation(rawToken: string): { valid: boolean; invitation?: AdminInvitation; reason?: string } {
    if (!rawToken || rawToken.length < 32) {
      return { valid: false, reason: 'Invalid or malformed invitation token' };
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const invitation = invitationRegistry.get(tokenHash);

    if (!invitation) {
      return { valid: false, reason: 'Invitation token not found or already purged' };
    }

    if (invitation.usedAt) {
      return { valid: false, reason: 'Invitation has already been consumed' };
    }

    if (new Date() > invitation.expiresAt) {
      return { valid: false, reason: 'Invitation has expired' };
    }

    // Atomic consumption
    invitation.usedAt = new Date();
    invitationRegistry.set(tokenHash, invitation);

    return {
      valid: true,
      invitation
    };
  }

  /**
   * Revokes an existing unconsumed invitation.
   */
  public static revokeInvitation(invitationId: string): boolean {
    for (const [tokenHash, inv] of invitationRegistry.entries()) {
      if (inv.id === invitationId) {
        inv.usedAt = new Date(0); // Mark permanently dead
        invitationRegistry.set(tokenHash, inv);
        return true;
      }
    }
    return false;
  }
}

