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

bot.run("No token for u")
