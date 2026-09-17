import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { userStore } from '../utils/userStore.js';

export const activateDemoMembership = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { plan } = req.body;

    const chosenPlan = plan === 'monthly' || plan === 'yearly' ? plan : 'yearly';

    // Update user in MongoDB / store
    const updatedUser = await userStore.updateMembership(user.id || user._id, {
      status: 'active',
      mode: 'demo',
      plan: chosenPlan,
    });

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        error: 'User account not found.',
      });
      return;
    }

    const safeUser = typeof updatedUser.toJSON === 'function' ? updatedUser.toJSON() : { ...updatedUser };
    delete safeUser.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Demo membership activated in database successfully.',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Demo membership activation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate demo membership in database.',
    });
  }
};

export const getMembershipStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    res.status(200).json({
      success: true,
      membershipStatus: user.membershipStatus,
      membershipMode: user.membershipMode,
      membershipPlan: user.membershipPlan,
      membershipStartDate: user.membershipStartDate,
      membershipEndDate: user.membershipEndDate,
      selectedCharity: user.selectedCharity,
      charityContributionPercentage: user.charityContributionPercentage,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve membership status.',
    });
  }
};

export const updateCharity = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { charityId, charityContributionPercentage } = req.body;

    if (!charityId || typeof charityId !== 'string') {
      res.status(400).json({ success: false, error: 'Valid charityId is required.' });
      return;
    }

    const percentage = Number(charityContributionPercentage) || 10;
    if (percentage < 10 || percentage > 100) {
      res.status(400).json({
        success: false,
        error: 'Charity contribution percentage must be between 10% and 100%.',
      });
      return;
    }

    const updatedUser = await userStore.updateCharity(
      (user.id || user._id).toString(),
      charityId,
      percentage
    );

    if (!updatedUser) {
      res.status(404).json({ success: false, error: 'User account not found.' });
      return;
    }

    const safeUser =
      typeof updatedUser.toJSON === 'function' ? updatedUser.toJSON() : { ...updatedUser };
    delete safeUser.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Charity updated successfully in database.',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('Charity update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update charity selection in database.',
    });
  }
};

