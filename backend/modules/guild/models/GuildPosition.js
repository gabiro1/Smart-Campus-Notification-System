import mongoose from 'mongoose';

const guildPositionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  // Holding a position with isPresident=true also elevates the user's
  // account role to 'guild_president', granting event creation/approval.
  isPresident: { type: Boolean, default: false },
}, { timestamps: true });

const GuildPosition = mongoose.model('GuildPosition', guildPositionSchema);

export const DEFAULT_GUILD_POSITIONS = [
  { name: 'Guild President', isPresident: true },
  { name: 'Vice President', isPresident: false },
  { name: 'Secretary', isPresident: false },
  { name: 'Student Welfare', isPresident: false },
];

export const ensureDefaultGuildPositions = async () => {
  const count = await GuildPosition.countDocuments();
  if (count === 0) {
    await GuildPosition.insertMany(DEFAULT_GUILD_POSITIONS);
  }
};

export default GuildPosition;
