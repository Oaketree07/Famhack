import discord
from discord.ext import commands

intents = discord.Intents.default()
intents.message_content = True  # IMPORTANT
intents.members = True  # Required for member join events

bot = commands.Bot(command_prefix="!", intents=intents)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}") # Test command

@bot.event
async def on_member_join(member):
    await member.send("Welcome to the CompSoc Discord Server!") # Someone make a better message than this, I am not creative

@bot.command()
async def ping(ctx):
    await ctx.send("pong 🏓")

bot.run("No token for u")
