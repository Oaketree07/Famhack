import discord 
from discord.ext import commands
import requests
import io

intents = discord.Intents.default()
intents.message_content = True  # IMPORTANT
intents.members = True  # Required for member join events

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")

@bot.event
async def on_member_join(member):
    await member.send("Welcome to the CompSoc Discord Server!") # Someone make a better message than this, I am not creative
    await member.send("To get started take this short quiz to find out which Sig you belong to")
    await member.send("https://societyq.netlify.app")

@bot.command()
async def ping(ctx):
    await ctx.send("pong 🏓")

@bot.command()
async def quiz(ctx):
    await ctx.send("Take the quiz to find out which Sig you belong to! https://societyq.netlify.app")

@bot.command()
async def sigs(ctx):
    sigs_message = (" There are lots of different sub societies (Sigs) in CompSoc, each with their own focus and activities\n"
    "come take a look at the sigs on the compsoc website https://comp-soc.com/")
    await ctx.send(sigs_message)

@bot.command()
@commands.is_owner()
async def dmall(ctx, *, message):
    """Send a DM to every user in the server. (Owner only)"""
    count = 0
    for member in ctx.guild.members:
        if member.bot:  # Skip bots
            continue
        try:
            await member.send(message)
            count += 1
        except discord.Forbidden:
            pass
    await ctx.send(f"✅ Sent DM to {count} users")

@bot.command()
@commands.is_owner()
async def dmrole(ctx, role: discord.Role, *, message):
    """Send a DM to every user with a specific role. (Owner only)"""
    count = 0
    for member in ctx.guild.members:
        if role in member.roles and not member.bot:  # Check if member has the role and is not a bot
            try:
                await member.send(message)
                count += 1
            except discord.Forbidden:
                pass
    await ctx.send(f"✅ Sent DM to {count} users with the {role.name} role")

@bot.command()
async def feedback(ctx, *, feedback):
    """Send feedback to the CompSoc team."""
    channel = bot.get_channel(1487477629186474085) 
    if channel:
        await channel.send(f"Feedback from {ctx.author}: {feedback}")
        await ctx.send("Thank you for your feedback! It has been sent to the CompSoc team.")
    else:
        await ctx.send("Sorry, I couldn't find the feedback channel.")

@bot.command()
async def sixseven(ctx):
    await ctx.send("67")
    await ctx.send("https://giphy.com/gifs/GrindCoin-67-6-7-six-seven-YaP3iYxN3T8nIEN5rD")


bot.run("No key for you bbg ;)")

